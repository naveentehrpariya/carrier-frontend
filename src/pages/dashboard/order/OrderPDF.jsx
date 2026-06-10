import { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import { useParams } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Logotext from '../../common/Logotext';
import TimeFormat from '../../common/TimeFormat';
import Currency from '../../common/Currency';
import Loading from '../../common/Loading';
import DistanceInMiles from '../../common/DistanceInMiles';

const PDF_W = 794;

const S = {
   label: { fontSize: '9px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '2px' },
   value: { fontSize: '11px', fontWeight: '600', color: '#111827' },
   sectionTitle: { fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#2563eb', marginBottom: '8px' },
};

export default function OrderPDF() {
   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState([]);
   const { Errors, company } = useContext(UserContext);
   const { id } = useParams();
   const [downloadingPdf, setDownloadingPdf] = useState(false);
   const [pdfProgress, setPdfProgress] = useState('');
   const pdfRef = useRef();
   const paperRef = useRef();
   const [pdfScale, setPdfScale] = useState(1);
   const todaydate = new Date();

   // Runs after loading→false so paperRef is in the DOM. zoom on pdfRef means paperRef
   // width is never affected by scale changes — no feedback loop.
   useEffect(() => {
      if (loading) return; // paper not mounted yet
      const el = paperRef.current;
      if (!el) return;
      const compute = () => {
         const w = el.offsetWidth;
         if (w > 0) setPdfScale(Math.min(1, w / PDF_W));
      };
      compute();
      const observer = new ResizeObserver(compute);
      observer.observe(el);
      return () => observer.disconnect();
   }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

   useEffect(() => {
      const existing = document.querySelector('#rc-fonts');
      if (existing) return;
      const link = document.createElement('link');
      link.id = 'rc-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
   }, []);

   const getLogoBase64 = async (url) => {
      if (!url || url.startsWith('data:')) return url;
      try {
         const resp = await fetch(url);
         if (!resp.ok) return null;
         const blob = await resp.blob();
         const blobUrl = URL.createObjectURL(blob);
         return await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
               const MAX_W = 600;
               const scale = img.naturalWidth > MAX_W ? MAX_W / img.naturalWidth : 1;
               const canvas = document.createElement('canvas');
               canvas.width = Math.round(img.naturalWidth * scale);
               canvas.height = Math.round(img.naturalHeight * scale);
               canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
               URL.revokeObjectURL(blobUrl);
               try { resolve(canvas.toDataURL('image/png')); }
               catch {
                  const fr = new FileReader();
                  fr.onload = () => resolve(fr.result);
                  fr.onerror = () => resolve(null);
                  fr.readAsDataURL(blob);
               }
            };
            img.onerror = () => { URL.revokeObjectURL(blobUrl); resolve(null); };
            img.src = blobUrl;
         });
      } catch { return null; }
   };

   const downloadPDF = async () => {
      setDownloadingPdf(true);
      setPdfProgress('Preparing...');
      window.scrollTo(0, 0);
      const element = pdfRef.current;
      if (!element) { setDownloadingPdf(false); setPdfProgress(''); return; }
      try {
         setPdfProgress('Generating PDF...');
         const logoUrl = company?.pdf_logo || company?.logo;
         const logoBase64 = logoUrl ? await getLogoBase64(logoUrl) : null;
         const clone = element.cloneNode(true);
         clone.style.zoom = '1';
         clone.querySelectorAll('img').forEach(img => {
            const alt = img.getAttribute('alt');
            if ((alt === 'logo' || alt === 'Logo') && logoBase64) {
               img.src = logoBase64;
            } else if (img.src.startsWith('/')) {
               img.src = window.location.origin + img.getAttribute('src');
            }
         });
         const res = await Api.post('/order/generate-pdf', {
            html: clone.outerHTML,
            filename: `CMC${order?.serial_no || ''}_RateConfirmation.pdf`,
            ...(logoBase64 && { logoBase64 }),
         }, { responseType: 'blob' });
         const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
         const a = document.createElement('a');
         a.href = url; a.download = `CMC${order?.serial_no || ''}_RateConfirmation.pdf`;
         document.body.appendChild(a); a.click(); document.body.removeChild(a);
         URL.revokeObjectURL(url);
         setPdfProgress('Downloaded!');
         setTimeout(() => setPdfProgress(''), 3000);
      } catch {
         setPdfProgress('Failed — retry');
         setTimeout(() => setPdfProgress(''), 3000);
      } finally { setDownloadingPdf(false); }
   };

   useEffect(() => {
      setLoading(true);
      Api.get(`/order/detail/${id}`).then(res => {
         setLoading(false);
         setOrder(res.data.status ? res.data.order : null);
      }).catch(err => { setLoading(false); Errors(err); });
   }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

   const defaultTerms = `Carrier is responsible to confirm the actual weight and count received from the shipper before transit.
Additional fees such as loading/unloading, pallet exchange, etc., are included in the agreed rate.
POD must be submitted within 5 days of delivery.
Freight charges include $100 for MacroPoint tracking. Non-compliance may lead to deduction.
Cross-border shipments require custom stamps or deductions may apply.`;

   const td = { padding: '7px 10px', borderBottom: '1px solid #e5e7eb', fontSize: '11px', verticalAlign: 'top' };
   const th = { ...td, fontWeight: '600', color: '#374151', background: '#f9fafb', borderBottom: '2px solid #e5e7eb' };

   return (
      <AuthLayout>
         {loading ? <Loading /> :
            <div style={{ minHeight: '100vh', padding: '20px 12px' }}>
               <div style={{ maxWidth: '794px', margin: '0 auto 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                     <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Rate Confirmation</div>
                     <div style={{ fontSize: '12px', color: '#d9d9d9' }}>Order #CMC{order?.serial_no}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     {pdfProgress && <span style={{ fontSize: '12px', color: '#2563eb' }}>{pdfProgress}</span>}
                     <button onClick={downloadPDF} disabled={downloadingPdf} style={{
                        background: downloadingPdf ? '#94a3b8' : '#1e293b', color: '#fff',
                        border: 'none', borderRadius: '6px', padding: '9px 18px',
                        fontSize: '13px', fontWeight: '600', cursor: downloadingPdf ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                     }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        {downloadingPdf ? 'Generating…' : 'Download PDF'}
                     </button>
                  </div>
               </div>

               <div ref={paperRef} style={{
                  maxWidth: `${PDF_W}px`, margin: '0 auto',
                  boxShadow: '0 2px 20px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  background: '#fff',
               }}>
                     <div id="pdf-root" ref={pdfRef} style={{
                        width: `${PDF_W}px`,
                        background: '#fff',
                        fontFamily: "'IBM Plex Sans', Arial, sans-serif",
                        fontSize: '11px', color: '#111827',
                        boxSizing: 'border-box',
                        zoom: pdfScale,
                     }}>
                        {/* HEADER */}
                        <div style={{ padding: '28px 36px 20px', borderBottom: '2px solid #111827', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                 <div style={{ fontSize: '22px', fontWeight: '700', color: '#111827', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Rate Confirmation</div>
                                 <div style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>{company?.name}</div>
                                 <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{company?.address}</div>
                                 <div style={{ fontSize: '11px', color: '#6b7280' }}>{company?.email} · {company?.phone}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                 {(company?.pdf_logo || company?.logo)
                                    ? <img src={company?.pdf_logo || company?.logo} alt="logo" style={{ height: '44px', width: 'auto', objectFit: 'contain', display: 'block', marginLeft: 'auto', marginBottom: '8px' }} />
                                    : <div style={{ marginBottom: '8px' }}><Logotext black={true} /></div>}
                                 <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>PRO # CMC{order?.serial_no}</div>
                                 <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}><TimeFormat date={todaydate} /></div>
                              </div>
                           </div>
                        </div>

                        {/* FROM / CARRIER */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '16px 36px', borderBottom: '1px solid #e5e7eb', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                           <div style={{ paddingRight: '24px', borderRight: '1px solid #e5e7eb' }}>
                              <div style={S.sectionTitle}>FROM</div>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827', marginBottom: '3px' }}>{company?.name}</div>
                              <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.7' }}>
                                 <div>{company?.email}</div><div>{company?.phone}</div><div>{company?.address}</div>
                              </div>
                           </div>
                           <div style={{ paddingLeft: '24px' }}>
                              <div style={S.sectionTitle}>CARRIER</div>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827', marginBottom: '3px', textTransform: 'uppercase' }}>
                                 {order?.carrier?.name}
                                 <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: '500', marginLeft: '6px', textTransform: 'none' }}>MC{order?.carrier?.mc_code}</span>
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.7' }}>
                                 <div>{order?.carrier?.phone}{order?.carrier?.secondary_phone ? `, ${order?.carrier?.secondary_phone}` : ''}</div>
                                 <div>{order?.carrier?.email?.trim()}</div>
                                 <div>{order?.carrier?.location}</div>
                              </div>
                           </div>
                        </div>

                        {/* SHIPPING DETAILS */}
                        {order?.shipping_details?.map((s, sIdx) => (
                           <div key={sIdx} style={{ padding: '0 36px' }}>

                              {/* Order info row */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '14px 0', borderBottom: '1px solid #e5e7eb', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                 {[
                                    ['Order No', `#CMC${order?.serial_no}`],
                                    order?.order_type === 'regular' && order?.customer_order_no ? ['Customer Order No', order.customer_order_no] : null,
                                    ['Commodity', s?.commodity?.value || s?.commodity],
                                    s?.reference ? ['Commodity Ref', s.reference] : null,
                                    ['Total Distance', <DistanceInMiles key="d" d={order.totalDistance} />],
                                    ['Equipment', s?.equipment?.value],
                                    ['Weight', `${s?.weight || ''}${s?.weight_unit || ''}`],
                                 ].filter(Boolean).map(([label, val], i) => (
                                    <div key={i}><div style={S.label}>{label}</div><div style={S.value}>{val}</div></div>
                                 ))}
                              </div>

                              {/* Charges */}
                              <div style={{ padding: '14px 0', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                 <div style={S.sectionTitle}>Charges</div>
                                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                       <tr>
                                          <th align='left' style={th}>Charge Type</th>
                                          <th align='left' style={th}>Comment</th>
                                          <th align='left' style={th}>Rate</th>
                                          <th style={{ ...th, textAlign: 'right' }}>Total</th>
                                       </tr>
                                    </thead>
                                    <tbody>
                                       {order?.carrier_revenue_items?.map((r, i) => (
                                          <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                             <td style={td}>{r?.revenue_item}</td>
                                             <td style={{ ...td, color: '#6b7280' }}>{r?.note}</td>
                                             <td style={td}><Currency onlySymbol={true} currency={order?.revenue_currency || 'cad'} />{r?.rate}×{r?.quantity || 0}</td>
                                             <td style={{ ...td, textAlign: 'right', fontWeight: '600' }}><Currency amount={r?.rate * r?.quantity || 0} currency={order?.revenue_currency || 'cad'} /></td>
                                          </tr>
                                       ))}
                                       <tr style={{ background: '#f9fafb', borderTop: '2px solid #111827' }}>
                                          <td colSpan={3} style={{ ...td, fontWeight: '700', textAlign: 'right', borderBottom: 'none' }}>Total</td>
                                          <td style={{ ...td, fontWeight: '700', textAlign: 'right', fontSize: '13px', borderBottom: 'none' }}>
                                             <Currency amount={order.carrier_revenue_items.reduce((a, r) => a + r.rate * r.quantity, 0)} currency={order?.revenue_currency || 'cad'} />
                                          </td>
                                       </tr>
                                    </tbody>
                                 </table>
                              </div>

                              {/* Processed By */}
                              {order?.created_by && (
                                 <div style={{ padding: '12px 0', borderTop: '1px solid #e5e7eb', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                    <div style={S.sectionTitle}>Processed By</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                       {[['Employee Name', order?.created_by?.name || 'N/A'], ['Employee ID', order?.created_by?.corporateID || 'N/A'], ['Email', order?.created_by?.email], ['Phone', order?.created_by?.phone || 'N/A']].map(([l, v]) => (
                                          <div key={l}><div style={S.label}>{l}</div><div style={S.value}>{v}</div></div>
                                       ))}
                                    </div>
                                 </div>
                              )}

                              {/* Locations */}
                              <div style={{ padding: '12px 0', borderTop: '1px solid #e5e7eb' }}>
                                 {s?.locations && (() => {
                                    let pc = 0, sc = 0;
                                    return s.locations.map((l, i) => {
                                       const isPick = l.type === 'pickup';
                                       if (isPick) pc++; else sc++;
                                       const num = isPick ? pc : sc;
                                       return (
                                          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                             <div style={{ width: '4px', flexShrink: 0, borderRadius: '2px', background: isPick ? '#2563eb' : '#dc2626', alignSelf: 'stretch' }} />
                                             <div style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '10px 12px' }}>
                                                <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: isPick ? '#2563eb' : '#dc2626', marginBottom: '3px' }}>
                                                   {isPick ? 'PICKUP' : 'STOP'} {num}
                                                </div>
                                                <div style={{ fontWeight: '600', color: '#111827', fontSize: '12px' }}>{l?.location}</div>
                                                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                                                   <TimeFormat time={false} date={l?.date} />
                                                   {l?.appointment && <span style={{ fontWeight: '600', marginLeft: '8px' }}>· Appt: {l?.appointment}</span>}
                                                </div>
                                                {l?.referenceNo && <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px' }}>Ref #: {l.referenceNo}</div>}
                                             </div>
                                          </div>
                                       );
                                    });
                                 })()}
                              </div>
                           </div>
                        ))}

                        {/* Terms */}
                        <div style={{ margin: '0 36px', padding: '12px 0', borderTop: '1px solid #e5e7eb', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                           <div style={S.sectionTitle}>Terms & Conditions</div>
                           {(company?.rate_confirmation_terms || defaultTerms).split('\n').filter(l => l.trim()).map((line, i) => (
                              <div key={i} style={{ fontSize: '10px', color: '#6b7280', lineHeight: '1.6', display: 'flex', gap: '6px', marginBottom: '3px' }}>
                                 <span style={{ color: '#9ca3af', flexShrink: 0 }}>·</span><span>{line}</span>
                              </div>
                           ))}
                        </div>

                        {/* Signature */}
                        <div style={{ margin: '0 36px', padding: '16px 0 28px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                           <div>
                              <div style={{ fontSize: '10px', color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Carrier Signature</div>
                              <div style={{ borderBottom: '1.5px solid #111827', width: '200px', height: '36px' }} />
                              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>Authorized signature required</div>
                           </div>
                           <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>CMC{order?.serial_no}</div>
                              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                                 {(todaydate.getMonth() + 1).toString().padStart(2, '0')}/{todaydate.getDate().toString().padStart(2, '0')}/{todaydate.getFullYear()} {todaydate.getHours()}:{todaydate.getMinutes().toString().padStart(2, '0')} {todaydate.getHours() >= 12 ? 'PM' : 'AM'}
                              </div>
                              <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>PRO# CMC{order?.serial_no} must appear on all invoices</div>
                           </div>
                        </div>

                        <div style={{ height: '3px', background: '#111827' }} />
                     </div>
                     {/* ── END PDF DOCUMENT ── */}

               </div>
            </div>
         }
      </AuthLayout>
   );
}
