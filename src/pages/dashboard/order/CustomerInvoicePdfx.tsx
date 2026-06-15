import { Document, Link, Page, StyleSheet, Text as PDFText, View } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import companyLogoFallback from '../../../img/logo.png';
import { PdfImage } from '../../../components/pdfx/pdf-image/pdfx-pdf-image.tsx';

type CustomerInvoicePdfxProps = {
  order: any;
  company: any;
  invoiceNo: string;
  issuedAt?: Date;
  theme?: any;
  logoSrc?: string;
};

function formatDateTime(value: Date | string | number | undefined) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function toCurrencyCode(value: string | undefined) {
  const v = (value ?? '').trim().toUpperCase();
  if (v.length === 3) return v;
  return 'USD';
}

function formatMoney(amount: number, currency: string | undefined) {
  const code = toCurrencyCode(currency);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(safeAmount);
  } catch {
    return `${safeAmount.toFixed(2)} ${code}`;
  }
}

const C = {
  navy: '#0f1923',
  amber: '#f5a623',
  orange: '#e8401e',
  blue: '#1a56db',
  white: '#ffffff',
  slate100: '#f1f5f9',
  slate200: '#e2e8f0',
  slate400: '#94a3b8',
  slate500: '#64748b',
  slate600: '#475569',
  slate800: '#1e293b',
  blueLight: '#eff6ff',
  blueBorder: '#bfdbfe',
  orangeLight: '#fff7f5',
  orangeBorder: '#fecaca',
  tableRow: '#f8faff',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 48,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: C.white,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: C.slate800,
  },

  // ── HEADER ──
  header: {
    backgroundColor: C.navy,
    paddingTop: 22,
    paddingBottom: 22,
    paddingLeft: 36,
    paddingRight: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 28,
    color: C.amber,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  headerCompanyName: {
    fontSize: 11,
    color: '#e2e8f0',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  headerSmall: {
    fontSize: 9,
    color: C.slate400,
    marginBottom: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    width: 200,
  },
  headerInvNo: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: C.amber,
    letterSpacing: 1,
    marginTop: 6,
    marginBottom: 2,
  },

  // Accent bar
  accentBar: {
    height: 4,
    backgroundColor: C.orange,
  },

  // ── BODY ──
  body: {
    paddingLeft: 36,
    paddingRight: 36,
  },

  // Section label
  sectionLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // ── BILL TO / INVOICE META ──
  billRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    borderBottomStyle: 'solid',
    paddingTop: 18,
    paddingBottom: 18,
    marginBottom: 14,
  },
  billCol: {
    flex: 1,
  },
  billColRight: {
    flex: 1,
    paddingLeft: 24,
    borderLeftWidth: 1,
    borderLeftColor: C.slate200,
    borderLeftStyle: 'solid',
  },
  accentBar3px: {
    width: 3,
    borderRadius: 2,
    marginRight: 7,
    height: 12,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: C.navy,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bodyText: {
    fontSize: 10,
    color: C.slate600,
    marginBottom: 2,
    lineHeight: 1.5,
  },
  metaLabel: {
    fontSize: 8,
    color: C.slate400,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.navy,
    marginBottom: 8,
  },
  metaValueBlue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: C.blue,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaCell: {
    width: '50%',
    marginBottom: 8,
  },

  // ── INFO CARD ──
  infoCard: {
    backgroundColor: '#f7f9ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderLeftColor: C.blue,
    borderRadius: 3,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoCell: {
    width: '25%',
    marginBottom: 8,
  },
  infoCellWide: {
    width: '33%',
    marginBottom: 8,
  },

  // ── CHARGES TABLE ──
  tableWrap: {
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: C.navy,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
  },
  tableHeaderCell: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: C.white,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    backgroundColor: C.tableRow,
  },
  tableCell: {
    fontSize: 10,
    color: C.slate800,
  },
  tableCellMuted: {
    fontSize: 10,
    color: C.slate500,
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: C.amber,
    paddingTop: 9,
    paddingBottom: 9,
    paddingLeft: 10,
    paddingRight: 10,
  },
  totalLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: C.navy,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: C.navy,
    textAlign: 'right',
  },

  // ── PROCESSED BY ──
  processedSection: {
    borderBottomWidth: 1,
    borderBottomColor: C.slate200,
    borderBottomStyle: 'solid',
    paddingBottom: 14,
    marginBottom: 14,
  },
  twoColRow: {
    flexDirection: 'row',
  },
  twoColLeft: {
    flex: 1,
    paddingRight: 12,
  },
  twoColRight: {
    flex: 1,
    paddingLeft: 12,
  },

  // ── LOCATIONS ──
  locationRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  locationBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
    paddingTop: 6,
  },
  locationBadgeText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: C.white,
    textAlign: 'center',
  },
  locationCard: {
    flex: 1,
    borderRadius: 4,
    padding: 10,
    borderWidth: 1,
    borderStyle: 'solid',
  },
  locationCardPick: {
    backgroundColor: C.blueLight,
    borderColor: C.blueBorder,
  },
  locationCardStop: {
    backgroundColor: C.orangeLight,
    borderColor: C.orangeBorder,
  },
  locationTypeLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  locationAddress: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: C.navy,
    marginBottom: 2,
  },
  locationMeta: {
    fontSize: 9,
    color: C.slate600,
    marginBottom: 1,
  },

  // ── REMITTANCE ──
  remittanceSection: {
    marginBottom: 14,
  },
  remittanceText: {
    fontSize: 10,
    color: C.slate600,
    marginBottom: 4,
  },

  // ── BANK DETAILS ──
  bankCard: {
    backgroundColor: '#f7f9ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderLeftColor: C.blue,
    borderRadius: 3,
    padding: 14,
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bankCell: {
    width: '50%',
    marginBottom: 10,
  },

  // ── FOOTER ──
  footer: {
    position: 'absolute',
    left: 36,
    right: 36,
    bottom: 18,
    borderTopWidth: 1,
    borderTopColor: C.slate200,
    borderTopStyle: 'solid',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInvNo: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: C.orange,
    letterSpacing: 0.5,
  },
  footerMeta: {
    fontSize: 8,
    color: C.slate400,
    textAlign: 'right',
  },

  // gradient bar (simulated with solid)
  footerBar: {
    height: 6,
    backgroundColor: C.navy,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

// ── Column width helpers ──
const col = {
  charge: '30%' as const,
  notes: '30%' as const,
  rate: '22%' as const,
  amount: '18%' as const,
};

export function CustomerInvoicePdfxDocument(props: CustomerInvoicePdfxProps) {
  return <CustomerInvoicePdfxContent {...props} />;
}

function CustomerInvoicePdfxContent({ order, company, invoiceNo, issuedAt, logoSrc }: CustomerInvoicePdfxProps) {
  const issued = issuedAt ?? new Date();
  // Invoice in the currency the customer was quoted (input_*); revenue_items rates are stored in base.
  const invHasInput = Number(order?.input_total_amount) > 0;
  const currency = invHasInput ? (order?.input_currency || order?.revenue_currency) : order?.revenue_currency;
  const itemFactor = (invHasInput && Number(order?.total_amount) > 0)
    ? Number(order.input_total_amount) / Number(order.total_amount) : 1;
  const logo = logoSrc || company?.pdf_logo || company?.logo || company?.logo_url || companyLogoFallback;
  const mailTo = company?.remittance_primary_email || company?.email || '';
  const cc = company?.remittance_secondary_email ? encodeURIComponent(company.remittance_secondary_email) : '';
  const mailToHref = mailTo ? `mailto:${mailTo}${cc ? `?cc=${cc}` : ''}` : '';

  const total = (order?.revenue_items || []).reduce(
    (acc: number, r: any) => acc + (Number(r?.rate) || 0) * (Number(r?.quantity) || 0) * itemFactor, 0
  );
  const displayTotal = invHasInput ? Number(order.input_total_amount) : (order?.total_amount ?? total);

  return (
    <Document title={`Invoice ${invoiceNo || ''}`}>
      <Page size="A4" orientation="portrait" style={styles.page}>

        {/* ── HEADER ── */}
        <View style={styles.header} fixed>
          <View>
            <PDFText style={styles.headerTitle}>Invoice</PDFText>
            <PDFText style={styles.headerCompanyName}>{company?.name || ''}</PDFText>
            <PDFText style={styles.headerSmall}>{company?.address || ''}</PDFText>
            <PDFText style={styles.headerSmall}>{company?.email || ''}</PDFText>
            {company?.phone ? <PDFText style={styles.headerSmall}>PH: {company.phone}</PDFText> : null}
          </View>
          <View style={styles.headerRight}>
            <PdfImage
              src={logo}
              style={{ width: 110, height: 28, marginBottom: 6, objectFit: 'contain' } as Style}
            />
            <PDFText style={styles.headerInvNo}>INV # {invoiceNo || ''}</PDFText>
            <PDFText style={styles.headerSmall}>{formatDateTime(issued)}</PDFText>
          </View>
        </View>

        {/* ACCENT BAR */}
        <View style={styles.accentBar} fixed />

        {/* ── BODY ── */}
        <View style={styles.body}>

          {/* BILL TO / INVOICE META */}
          <View style={styles.billRow} wrap={false}>
            {/* BILL TO */}
            <View style={styles.billCol}>
              <View style={styles.sectionLabelRow}>
                <View style={[styles.accentBar3px, { backgroundColor: C.blue }]} />
                <PDFText style={[styles.sectionLabel, { color: C.blue }]}>BILL TO</PDFText>
              </View>
              <PDFText style={styles.customerName}>
                {order?.customer?.name || ''}
                {order?.customer?.customerCode ? `  (Ref: ${order.customer.customerCode})` : ''}
              </PDFText>
              {order?.customer?.address ? <PDFText style={styles.bodyText}>{order.customer.address}</PDFText> : null}
              {order?.customer?.email ? <PDFText style={styles.bodyText}>{order.customer.email}</PDFText> : null}
              {order?.customer?.phone ? <PDFText style={styles.bodyText}>{order.customer.phone}</PDFText> : null}
            </View>

            {/* INVOICE META */}
            <View style={styles.billColRight}>
              <View style={styles.sectionLabelRow}>
                <View style={[styles.accentBar3px, { backgroundColor: C.orange }]} />
                <PDFText style={[styles.sectionLabel, { color: C.orange }]}>INVOICE DETAILS</PDFText>
              </View>
              <View style={styles.metaRow}>
                <View style={styles.metaCell}>
                  <PDFText style={styles.metaLabel}>Order Number</PDFText>
                  <PDFText style={styles.metaValueBlue}>
                    {order?.serial_no ? `#CMC${order.serial_no}` : '—'}
                  </PDFText>
                </View>
                {order?.order_type === 'regular' && order?.customer_order_no ? (
                  <View style={styles.metaCell}>
                    <PDFText style={styles.metaLabel}>Customer Order No</PDFText>
                    <PDFText style={styles.metaValue}>{order.customer_order_no}</PDFText>
                  </View>
                ) : null}
                <View style={styles.metaCell}>
                  <PDFText style={styles.metaLabel}>Invoice Date</PDFText>
                  <PDFText style={[styles.metaValue, { fontSize: 9 }]}>{formatDateTime(Date.now())}</PDFText>
                </View>
                <View style={styles.metaCell}>
                  <PDFText style={styles.metaLabel}>Amount Due</PDFText>
                  <PDFText style={styles.metaValue}>{formatMoney(displayTotal, currency)}</PDFText>
                </View>
              </View>
            </View>
          </View>

          {/* SHIPPING DETAILS */}
          {(order?.shipping_details || []).map((s: any, sIdx: number) => (
            <View key={sIdx}>
              {/* INFO CARD */}
              <View style={styles.infoCard} wrap={false}>
                <View style={styles.infoCellWide}>
                  <PDFText style={styles.metaLabel}>Order No</PDFText>
                  <PDFText style={styles.metaValueBlue}>
                    {order?.serial_no ? `#CMC${order.serial_no}` : '—'}
                  </PDFText>
                </View>
                {(s?.commodity?.value || s?.commodity) ? (
                  <View style={styles.infoCellWide}>
                    <PDFText style={styles.metaLabel}>Commodity</PDFText>
                    <PDFText style={styles.metaValue}>{s?.commodity?.value || s?.commodity}</PDFText>
                  </View>
                ) : null}
                {s?.reference ? (
                  <View style={styles.infoCellWide}>
                    <PDFText style={styles.metaLabel}>Commodity Ref</PDFText>
                    <PDFText style={styles.metaValue}>{s.reference}</PDFText>
                  </View>
                ) : null}
                {s?.equipment?.value ? (
                  <View style={styles.infoCellWide}>
                    <PDFText style={styles.metaLabel}>Equipment</PDFText>
                    <PDFText style={styles.metaValue}>{s.equipment.value}</PDFText>
                  </View>
                ) : null}
                {s?.weight ? (
                  <View style={styles.infoCellWide}>
                    <PDFText style={styles.metaLabel}>Weight</PDFText>
                    <PDFText style={styles.metaValue}>{`${s.weight}${s?.weight_unit || ''}`}</PDFText>
                  </View>
                ) : null}
              </View>

              {/* LOCATIONS */}
              {(s?.locations || []).map((l: any, i: number) => {
                const isPickup = l?.type === 'pickup';
                return (
                  <View key={i} style={styles.locationRow} wrap={false}>
                    <View style={[styles.locationBadge, { backgroundColor: isPickup ? C.blue : C.orange }]}>
                      <PDFText style={styles.locationBadgeText}>
                        {isPickup ? 'P' : 'S'}
                      </PDFText>
                    </View>
                    <View style={[styles.locationCard, isPickup ? styles.locationCardPick : styles.locationCardStop]}>
                      <PDFText style={[styles.locationTypeLabel, { color: isPickup ? C.blue : C.orange }]}>
                        {isPickup ? 'PICKUP' : 'STOP'}
                      </PDFText>
                      <PDFText style={styles.locationAddress}>{l?.location || ''}</PDFText>
                      {l?.date ? <PDFText style={styles.locationMeta}>{formatDateTime(l.date)}</PDFText> : null}
                      {l?.appointment ? (
                        <PDFText style={[styles.locationMeta, { fontFamily: 'Helvetica-Bold', color: isPickup ? C.blue : C.orange }]}>
                          Appt: {l.appointment}
                        </PDFText>
                      ) : null}
                      {l?.referenceNo ? <PDFText style={styles.locationMeta}>Ref #: {l.referenceNo}</PDFText> : null}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}

          {/* CHARGES TABLE */}
          <View style={styles.tableWrap} wrap={false}>
            <View style={styles.sectionLabelRow}>
              <View style={[styles.accentBar3px, { backgroundColor: C.amber, height: 14 }]} />
              <PDFText style={[styles.sectionLabel, { color: C.navy }]}>CHARGES</PDFText>
            </View>

            {/* Header row */}
            <View style={styles.tableHeaderRow}>
              <PDFText style={[styles.tableHeaderCell, { width: col.charge }]}>Charges</PDFText>
              <PDFText style={[styles.tableHeaderCell, { width: col.notes }]}>Notes</PDFText>
              <PDFText style={[styles.tableHeaderCell, { width: col.rate, textAlign: 'center' }]}>Rate</PDFText>
              <PDFText style={[styles.tableHeaderCell, { width: col.amount, textAlign: 'right' }]}>Amount</PDFText>
            </View>

            {/* Data rows */}
            {(order?.revenue_items || []).map((r: any, idx: number) => (
              <View key={idx} style={[styles.tableRow, idx % 2 !== 0 ? styles.tableRowAlt : {}]} wrap={false}>
                <PDFText style={[styles.tableCell, { width: col.charge }]}>{r?.revenue_item || ''}</PDFText>
                <PDFText style={[styles.tableCellMuted, { width: col.notes }]}>{r?.note || ''}</PDFText>
                <PDFText style={[styles.tableCellMuted, { width: col.rate, textAlign: 'center' }]}>
                  {`${formatMoney((r?.rate || 0) * itemFactor, currency)} × ${r?.quantity || 0}`}
                </PDFText>
                <PDFText style={[styles.tableCell, { width: col.amount, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>
                  {formatMoney((r?.rate || 0) * (r?.quantity || 0) * itemFactor, currency)}
                </PDFText>
              </View>
            ))}

            {/* Total row */}
            <View style={styles.totalRow} wrap={false}>
              <PDFText style={[styles.totalLabel, { width: col.charge }]}>{''}</PDFText>
              <PDFText style={[styles.totalLabel, { width: col.notes }]}>{''}</PDFText>
              <PDFText style={[styles.totalLabel, { width: col.rate, textAlign: 'center' }]}>TOTAL AMOUNT DUE</PDFText>
              <PDFText style={[styles.totalValue, { width: col.amount }]}>{formatMoney(displayTotal, currency)}</PDFText>
            </View>
          </View>

          {/* PROCESSED BY */}
          {order?.created_by ? (
            <View style={styles.processedSection} wrap={false}>
              <PDFText style={[styles.sectionLabel, { color: C.slate400, marginBottom: 10 }]}>PROCESSED BY</PDFText>
              <View style={styles.twoColRow}>
                <View style={styles.twoColLeft}>
                  <PDFText style={styles.metaLabel}>Employee Name</PDFText>
                  <PDFText style={[styles.metaValue, { marginBottom: 10 }]}>
                    {order?.created_by?.name || 'N/A'}
                  </PDFText>
                  <PDFText style={styles.metaLabel}>Email</PDFText>
                  <PDFText style={[styles.bodyText, { marginBottom: 0 }]}>{order?.created_by?.email || ''}</PDFText>
                </View>
                <View style={styles.twoColRight}>
                  <PDFText style={styles.metaLabel}>Employee ID</PDFText>
                  <PDFText style={[styles.metaValue, { marginBottom: 10 }]}>
                    {order?.created_by?.corporateID || 'N/A'}
                  </PDFText>
                  <PDFText style={styles.metaLabel}>Phone</PDFText>
                  <PDFText style={[styles.bodyText, { marginBottom: 0 }]}>{order?.created_by?.phone || 'N/A'}</PDFText>
                </View>
              </View>
            </View>
          ) : null}

          {/* REMITTANCE */}
          <View style={styles.remittanceSection} wrap={false}>
            <PDFText style={[styles.sectionLabel, { color: C.slate400, marginBottom: 8 }]}>REMITTANCE</PDFText>
            <PDFText style={styles.remittanceText}>Please send remittance to </PDFText>
            {mailToHref ? (
              <Link src={mailToHref} style={{ color: C.blue, fontSize: 10, textDecoration: 'none' }}>
                {mailTo}
              </Link>
            ) : null}
            {company?.remittance_secondary_email ? (
              <PDFText style={[styles.remittanceText, { color: C.slate500 }]}>
                {`  (cc: ${company.remittance_secondary_email})`}
              </PDFText>
            ) : null}
          </View>

          {/* BANK DETAILS */}
          {order?.order_type !== 'regular' && (
            <View wrap={false}>
              <View style={styles.sectionLabelRow}>
                <View style={[styles.accentBar3px, { backgroundColor: C.blue, height: 14 }]} />
                <PDFText style={[styles.sectionLabel, { color: C.navy }]}>
                  {`BANK — ${(company?.bank_name || 'ROYAL BANK OF CANADA').toUpperCase()}`}
                </PDFText>
              </View>
              <View style={styles.bankCard}>
                <View style={styles.bankCell}>
                  <PDFText style={styles.metaLabel}>Bank Name</PDFText>
                  <PDFText style={styles.metaValue}>{company?.bank_name || '—'}</PDFText>
                </View>
                <View style={styles.bankCell}>
                  <PDFText style={styles.metaLabel}>Account Name</PDFText>
                  <PDFText style={styles.metaValue}>{company?.account_name || '—'}</PDFText>
                </View>
                <View style={styles.bankCell}>
                  <PDFText style={styles.metaLabel}>Account Number</PDFText>
                  <PDFText style={styles.metaValue}>{company?.account_number || '—'}</PDFText>
                </View>
                <View style={styles.bankCell}>
                  <PDFText style={styles.metaLabel}>Routing Number</PDFText>
                  <PDFText style={styles.metaValue}>{company?.routing_number || '—'}</PDFText>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* ── FIXED FOOTER ── */}
        <View style={styles.footer} fixed>
          <PDFText style={styles.footerInvNo}>INV# {invoiceNo || ''}</PDFText>
          <PDFText
            style={styles.footerMeta}
            render={({ pageNumber, totalPages }) =>
              `${formatDateTime(issued)}  •  Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>

        <View style={styles.footerBar} fixed />
      </Page>
    </Document>
  );
}
