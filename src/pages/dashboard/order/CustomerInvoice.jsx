import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import { useParams } from 'react-router-dom';
import AuthLayout from '../../../layout/AuthLayout';
import Logotext from '../../common/Logotext';
import TimeFormat from '../../common/TimeFormat';
import Currency from '../../common/Currency';
import Loading from './../../common/Loading';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { CustomerInvoicePdfxDocument } from './CustomerInvoicePdfx.tsx';

const PDF_W = 794;

const S = {
   label: { fontSize: '9px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '2px' },
   value: { fontSize: '11px', fontWeight: '600', color: '#111827' },
   sectionTitle: { fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#2563eb', marginBottom: '8px' },
};

export default function CustomerInvoice() {
   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState([]);
   const { Errors, company } = useContext(UserContext);
   const { id } = useParams();
   const [downloadingPdf, setDownloadingPdf] = useState(false);
   const [pdfProgress, setPdfProgress] = useState('');
   const [downloadingPdfx, setDownloadingPdfx] = useState(false);
   const [pdfxProgress, setPdfxProgress] = useState('');
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
      const existing = document.querySelector('#inv-fonts');
      if (existing) return;
      const link = document.createElement('link');
      link.id = 'inv-fonts';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
   }, []);

   useEffect(() => {
      setLoading(true);
      Api.get(`/order/detail/${id}`).then(res => {
         setLoading(false);
         setOrder(res.data.status ? res.data.order : null);
      }).catch(err => { setLoading(false); Errors(err); });
   }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

   const [invoiceNo, setInvoiceNo] = useState('');
   useEffect(() => {
      if (order) setInvoiceNo(`${order?.serial_no}-${todaydate.getMonth() + 1}${todaydate.getDate()}${Math.floor(Math.random() * 1000)}`);
   }, [order]); // eslint-disable-line react-hooks/exhaustive-deps

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
            filename: `CMC${order?.serial_no || ''}_invoice-${invoiceNo}.pdf`,
            docType: 'invoice',
            ...(logoBase64 && { logoBase64 }),
         }, { responseType: 'blob' });
         const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
         const a = document.createElement('a');
         a.href = url; a.download = `CMC${order?.serial_no || ''}_invoice-${invoiceNo}.pdf`;
         document.body.appendChild(a); a.click(); document.body.removeChild(a);
         URL.revokeObjectURL(url);
         setPdfProgress('Downloaded!');
         setTimeout(() => setPdfProgress(''), 3000);
      } catch {
         setPdfProgress('Failed — retry');
         setTimeout(() => setPdfProgress(''), 3000);
      } finally { setDownloadingPdf(false); }
   };

   const downloadPDFx = async () => {
      setDownloadingPdfx(true);
      setPdfxProgress('Generating PDFx...');
      try {
         const blob = await pdf(
            <CustomerInvoicePdfxDocument order={order} company={company} invoiceNo={invoiceNo} issuedAt={todaydate} />
         ).toBlob();
         saveAs(blob, `CMC${order?.serial_no || ''}_invoice-${invoiceNo}-pdfx.pdf`);
         setPdfxProgress('Downloaded!');
         setTimeout(() => setPdfxProgress(''), 3000);
      } catch {
         setPdfxProgress('Failed — retry');
         setTimeout(() => setPdfxProgress(''), 3000);
      } finally { setDownloadingPdfx(false); }
   };

   const td = { padding: '7px 10px', borderBottom: '1px solid #e5e7eb', fontSize: '11px', verticalAlign: 'top' };
   const th = { ...td, fontWeight: '600', color: '#374151', background: '#f9fafb', borderBottom: '2px solid #e5e7eb' };

   const Btn = ({ onClick, disabled, children }) => (
      <button onClick={onClick} disabled={disabled} style={{
         background: disabled ? '#94a3b8' : '#1e293b', color: '#fff',
         border: 'none', borderRadius: '6px', padding: '9px 16px',
         fontSize: '12px', fontWeight: '600', cursor: disabled ? 'not-allowed' : 'pointer',
         display: 'flex', alignItems: 'center', gap: '5px'
      }}>{children}</button>
   );

   const DlIcon = () => (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
         <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
   );

   // Invoice the customer in the currency they were originally quoted (input_*),
   // not the internal base currency. revenue_items rates are stored in base, so back-convert.
   const invHasInput = Number(order?.input_total_amount) > 0;
   const invCurrency = invHasInput ? (order?.input_currency || 'usd') : (order?.revenue_currency || 'usd');
   const invFactor = (invHasInput && Number(order?.total_amount) > 0)
      ? Number(order.input_total_amount) / Number(order.total_amount) : 1;
   const invTotal = invHasInput ? order.input_total_amount : (order?.total_amount || 0);

   return (
      <AuthLayout>
         {loading ? <Loading /> :
            <div style={{  minHeight: '100vh', padding: '20px 12px' }}>

               {/* Controls */}
               <div style={{ maxWidth: `${PDF_W}px`, margin: '0 auto 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                     <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>Customer Invoice</div>
                     <div style={{ fontSize: '12px', color: '#64748b' }}>Order #CMC{order?.serial_no}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                     {(pdfProgress || pdfxProgress) && (
                        <span style={{ fontSize: '12px', color: '#2563eb' }}>{pdfProgress || pdfxProgress}</span>
                     )}
                     <Btn onClick={downloadPDF} disabled={downloadingPdf}>
                        <DlIcon />{downloadingPdf ? 'Generating…' : 'PDF'}
                     </Btn>
                     {/* <Btn onClick={downloadPDFx} disabled={downloadingPdfx}>
                        <DlIcon />{downloadingPdfx ? 'Generating…' : 'PDFx'}
                     </Btn> */}
                  </div>
               </div>

               {/* Paper wrapper — measured by ResizeObserver to compute exact pdfScale */}
               <div ref={paperRef} style={{
                  maxWidth: `${PDF_W}px`, margin: '0 auto',
                  boxShadow: '0 2px 20px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  background: '#fff',
               }}>
                     {/* ── PDF DOCUMENT — zoom here (no minWidth) so layout width = 794*scale ── */}
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
                                 <div style={{ fontSize: '22px', fontWeight: '700', color: '#111827', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Invoice</div>
                                 <div style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>{company?.name}</div>
                                 <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>{company?.address}</div>
                                 <div style={{ fontSize: '11px', color: '#6b7280' }}>{company?.email} · PH: {company?.phone}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                 {(company?.pdf_logo || company?.logo)
                                    ? <img src={company?.pdf_logo || company?.logo} alt="logo" style={{ height: '44px', width: 'auto', objectFit: 'contain', display: 'block', marginLeft: 'auto', marginBottom: '8px' }} />
                                    : <div style={{ marginBottom: '8px' }}><Logotext black={true} /></div>}
                                 <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>INV # {invoiceNo}</div>
                                 <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}><TimeFormat date={todaydate} time={true} /></div>
                              </div>
                           </div>
                        </div>

                        {/* BILL TO / INVOICE META */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '16px 36px', borderBottom: '1px solid #e5e7eb', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                           <div style={{ paddingRight: '24px', borderRight: '1px solid #e5e7eb' }}>
                              <div style={S.sectionTitle}>BILL TO</div>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: '#111827', textTransform: 'uppercase', marginBottom: '3px' }}>
                                 {order?.customer?.name}
                                 {order?.customer?.customerCode && <span style={{ fontSize: '10px', color: '#6b7280', fontWeight: '400', textTransform: 'none', marginLeft: '6px' }}>Ref: {order?.customer?.customerCode}</span>}
                              </div>
                              <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.7' }}>
                                 <div>{order?.customer?.address}</div>
                                 <div>{order?.customer?.email}</div>
                                 <div>{order?.customer?.phone}</div>
                              </div>
                           </div>
                           <div style={{ paddingLeft: '24px' }}>
                              <div style={S.sectionTitle}>INVOICE DETAILS</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                 <div><div style={S.label}>Order No</div><div style={{ ...S.value, color: '#2563eb' }}>#CMC{order?.serial_no}</div></div>
                                 {order?.order_type === 'regular' && order?.customer_order_no && <div><div style={S.label}>Cust. Order No</div><div style={S.value}>{order.customer_order_no}</div></div>}
                                 <div><div style={S.label}>Invoice Date</div><div style={{ ...S.value, fontSize: '10px', fontWeight: '500' }}><TimeFormat time={true} date={Date.now()} /></div></div>
                                 <div><div style={S.label}>Amount Due</div><div style={S.value}><Currency amount={invTotal} currency={invCurrency} /></div></div>
                              </div>
                           </div>
                        </div>

                        {/* SHIPPING DETAILS — flat, no shared wrapper */}
                        {order?.shipping_details?.map((s, sIdx) => (
                           <div key={sIdx} style={{ padding: '0 36px' }}>
                              {/* Order info row */}
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '14px 0', borderBottom: '1px solid #e5e7eb' }}>
                                 {[
                                    ['Order No', `#CMC${order?.serial_no}`],
                                    order?.order_type === 'regular' && order?.customer_order_no ? ['Customer Order No', order.customer_order_no] : null,
                                    ['Commodity', s?.commodity?.value || s?.commodity],
                                    s?.reference ? ['Commodity Ref', s.reference] : null,
                                    ['Equipment', s?.equipment?.value],
                                    ['Weight', `${s?.weight || ''}${s?.weight_unit || ''}`],
                                 ].filter(Boolean).map(([label, val], i) => (
                                    <div key={i}><div style={S.label}>{label}</div><div style={S.value}>{val}</div></div>
                                 ))}
                              </div>
                              {/* Locations */}
                              <div style={{ padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                                 {s?.locations && (() => {
                                    let pc = 0, sc = 0;
                                    return s.locations.map((l, i) => {
                                       const isPick = l.type === 'pickup';
                                       if (isPick) pc++; else sc++;
                                       const num = isPick ? pc : sc;
                                       return (
                                          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                             <div style={{ width: '4px', flexShrink: 0, borderRadius: '2px', background: isPick ? '#2563eb' : '#dc2626', alignSelf: 'stretch' }} />
                                             <div style={{ flex: 1, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '9px 12px' }}>
                                                <div style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', color: isPick ? '#2563eb' : '#dc2626', marginBottom: '3px' }}>
                                                   {isPick ? 'PICKUP' : 'STOP'} {num}
                                                </div>
                                                <div style={{ fontWeight: '600', color: '#111827', fontSize: '12px' }}>{l?.location}</div>
                                                {l?.customer && <div style={{ fontSize: '10px', color: '#374151', marginTop: '1px', fontWeight: '600' }}>Customer: {l.customer}</div>}
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

                        {/* CHARGES TABLE */}
                        <div style={{ padding: '14px 36px' }}>
                           <div style={S.sectionTitle}>Charges</div>
                           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                 <tr>
                                    <th align="left" style={th}>Charges</th>
                                    <th align="left" style={th}>Notes</th>
                                    <th align="left" style={th}>Rate</th>
                                    <th style={{ ...th, textAlign: 'right' }}>Amount</th>
                                 </tr>
                              </thead>
                              <tbody>
                                 {order?.revenue_items?.map((r, i) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                       <td style={td}>{r?.revenue_item}</td>
                                       <td style={{ ...td, color: '#6b7280' }}>{r?.note}</td>
                                       <td style={td}><Currency onlySymbol={true} currency={invCurrency} />{Number(((r?.rate || 0) * invFactor).toFixed(2))}×{r?.quantity || 0}</td>
                                       <td style={{ ...td, textAlign: 'right', fontWeight: '600' }}><Currency amount={(r?.rate * r?.quantity || 0) * invFactor} currency={invCurrency} /></td>
                                    </tr>
                                 ))}
                                 <tr style={{ background: '#f9fafb', borderTop: '2px solid #111827' }}>
                                    <td colSpan={3} style={{ ...td, fontWeight: '700', textAlign: 'right', borderBottom: 'none' }}>Total</td>
                                    <td style={{ ...td, fontWeight: '700', textAlign: 'right', fontSize: '13px', borderBottom: 'none' }}>
                                       <Currency amount={invTotal} currency={invCurrency} />
                                    </td>
                                 </tr>
                              </tbody>
                           </table>
                        </div>

                        {/* PROCESSED BY */}
                        {order?.created_by && (
                           <div style={{ padding: '12px 36px 10px', borderTop: '1px solid #e5e7eb' }}>
                              <div style={S.sectionTitle}>Processed By</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                 {[['Employee Name', order?.created_by?.name || 'N/A'], ['Employee ID', order?.created_by?.corporateID || 'N/A'], ['Email', order?.created_by?.email], ['Phone', order?.created_by?.phone || 'N/A']].map(([l, v]) => (
                                    <div key={l}><div style={S.label}>{l}</div><div style={S.value}>{v}</div></div>
                                 ))}
                              </div>
                           </div>
                        )}

                        {/* REMITTANCE */}
                        <div style={{ padding: '12px 36px 10px', borderTop: '1px solid #e5e7eb' }}>
                           <div style={S.sectionTitle}>Remittance</div>
                           <div style={{ fontSize: '11px', color: '#374151' }}>
                              Please send remittance to{' '}
                              <a href={`mailto:${company?.remittance_primary_email || company?.email || ''}${company?.remittance_secondary_email ? `?cc=${encodeURIComponent(company.remittance_secondary_email)}` : ''}`}
                                 style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
                                 {company?.remittance_primary_email || company?.email || ''}
                              </a>
                              {company?.remittance_secondary_email && <span style={{ color: '#6b7280', marginLeft: '6px' }}>(cc: {company.remittance_secondary_email})</span>}
                           </div>
                        </div>

                        {/* BANK DETAILS */}
                        {order?.order_type !== 'regular' && (
                           <div style={{ padding: '12px 36px 10px', borderTop: '1px solid #e5e7eb' }}>
                              <div style={S.sectionTitle}>Bank — {company?.bank_name || 'Royal Bank of Canada'}</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '12px 14px' }}>
                                 {[['Bank Name', company?.bank_name], ['Account Name', company?.account_name], ['Account Number', company?.account_number], ['Routing Number', company?.routing_number]].map(([l, v]) => (
                                    <div key={l}><div style={S.label}>{l}</div><div style={S.value}>{v || '—'}</div></div>
                                 ))}
                              </div>
                           </div>
                        )}

                        {/* FOOTER */}
                        <div style={{ padding: '16px 36px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
                           <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: '700', fontSize: '13px', color: '#111827' }}>INV# {invoiceNo}</div>
                              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}><TimeFormat date={todaydate} time={true} /></div>
                              <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>INVOICE# {invoiceNo} must appear on all payments</div>
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
