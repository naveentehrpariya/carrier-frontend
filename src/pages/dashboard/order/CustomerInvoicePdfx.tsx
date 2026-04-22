import { Heading } from '../../../components/pdfx/heading/pdfx-heading.tsx';
import { KeyValue } from '../../../components/pdfx/key-value/pdfx-key-value.tsx';
import { PdfImage } from '../../../components/pdfx/pdf-image/pdfx-pdf-image.tsx';
import { Section } from '../../../components/pdfx/section/pdfx-section.tsx';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../../components/pdfx/table/pdfx-table.tsx';
import { Text } from '../../../components/pdfx/text/pdfx-text.tsx';
import { PdfxThemeProvider, usePdfxTheme } from '../../../lib/pdfx-theme-context.tsx';
import type { PdfxTheme } from '../../../lib/pdfx-theme';
import { Document, Link, Page, StyleSheet, Text as PdfText, View } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import companyLogoFallback from '../../../img/logo.png';

type CustomerInvoicePdfxProps = {
  order: any;
  company: any;
  invoiceNo: string;
  issuedAt?: Date;
  theme?: PdfxTheme;
  logoSrc?: string;
};

function formatDateTime(value: Date | string | number | undefined) {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString();
}

function toCurrencyCode(value: string | undefined) {
  const v = (value ?? '').trim();
  if (!v) return 'USD';
  if (v.length === 3) return v.toUpperCase();
  if (v.toLowerCase() === 'cad') return 'CAD';
  if (v.toLowerCase() === 'usd') return 'USD';
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

export function CustomerInvoicePdfxDocument(props: CustomerInvoicePdfxProps) {
  return (
    <PdfxThemeProvider theme={props.theme}>
      <CustomerInvoicePdfxContent {...props} />
    </PdfxThemeProvider>
  );
}

function CustomerInvoicePdfxContent({ order, company, invoiceNo, issuedAt, logoSrc }: CustomerInvoicePdfxProps) {
  const theme = usePdfxTheme();
  const issued = issuedAt ?? new Date();

  const styles = StyleSheet.create({
    page: {
      paddingTop: theme.spacing.page.marginTop,
      paddingRight: theme.spacing.page.marginRight,
      paddingBottom: theme.spacing.page.marginBottom,
      paddingLeft: theme.spacing.page.marginLeft,
      backgroundColor: theme.colors.background,
      color: theme.colors.foreground,
      fontFamily: theme.typography.body.fontFamily,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.primitives.spacing[4],
      paddingBottom: theme.primitives.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      borderBottomStyle: 'solid',
    },
    headerLeft: {
      flexGrow: 1,
      paddingRight: theme.primitives.spacing[4],
    },
    headerRight: {
      width: 220,
      alignItems: 'flex-end',
    },
    billToRow: {
      flexDirection: 'row',
      gap: theme.primitives.spacing[6],
      marginBottom: theme.primitives.spacing[8],
    },
    twoCol: {
      flex: 1,
    },
    badge: {
      backgroundColor: theme.colors.accent,
      color: theme.colors.primaryForeground,
      borderRadius: theme.primitives.borderRadius.md,
      paddingVertical: 4,
      paddingHorizontal: 8,
      fontSize: theme.primitives.typography.xs,
      fontWeight: theme.primitives.fontWeights.bold,
      alignSelf: 'flex-start',
    },
    pill: {
      borderRadius: theme.primitives.borderRadius.md,
      paddingVertical: 8,
      paddingHorizontal: 10,
      marginBottom: theme.primitives.spacing[3],
    },
    pickPill: {
      backgroundColor: '#e1eee8',
    },
    stopPill: {
      backgroundColor: '#dbeafe',
    },
    bankBox: {
      borderWidth: 1,
      borderStyle: 'solid',
      borderColor: theme.colors.border,
      borderRadius: theme.primitives.borderRadius.lg,
      padding: theme.primitives.spacing[4],
      marginTop: theme.primitives.spacing[3],
    },
    footer: {
      position: 'absolute',
      left: theme.spacing.page.marginLeft,
      right: theme.spacing.page.marginRight,
      bottom: theme.primitives.spacing[4],
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      borderTopStyle: 'solid',
      paddingTop: theme.primitives.spacing[2],
      fontSize: theme.primitives.typography.xs,
      color: theme.colors.mutedForeground,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });

  const currency = order?.revenue_currency;
  const mailTo = company?.remittance_primary_email || company?.email || '';
  const cc = company?.remittance_secondary_email ? encodeURIComponent(company.remittance_secondary_email) : '';
  const mailToHref = mailTo ? `mailto:${mailTo}${cc ? `?cc=${cc}` : ''}` : '';

  const logo = logoSrc || company?.logo || company?.logo_url || companyLogoFallback;

  return (
    <Document title={`Invoice ${invoiceNo || ''}`}>
      <Page size={theme.page.size} orientation={theme.page.orientation} style={styles.page}>
        <View style={styles.headerRow} wrap={false}>
          <View style={styles.headerLeft}>
            <Heading level={2} noMargin>
              INVOICE
            </Heading>
            <Text noMargin style={{ fontWeight: theme.primitives.fontWeights.bold }}>
              {company?.address || ''}
            </Text>
            <Text noMargin>{company?.email || ''}</Text>
            <Text noMargin>{company?.phone ? `PH : ${company.phone}` : ''}</Text>
          </View>
          <View style={styles.headerRight}>
            <PdfImage src={logo} style={{ width: 140, height: 32, marginBottom: 8 } as Style} />
            <Text noMargin>{`Invoice # ${invoiceNo || ''}`}</Text>
            <Text noMargin variant="xs" color="mutedForeground">
              {`Date: ${formatDateTime(issued)}`}
            </Text>
          </View>
        </View>

        <Section noWrap style={styles.billToRow as Style}>
          <View style={styles.twoCol}>
            <Text color="accent" style={{ fontWeight: theme.primitives.fontWeights.bold }} transform="uppercase" noMargin>
              Bill To
            </Text>
            <Text noMargin transform="uppercase">
              {`${order?.customer?.name || ''}${
                order?.customer?.customerCode ? ` (Ref No: ${order.customer.customerCode})` : ''
              }`}
            </Text>
            <Text noMargin>{order?.customer?.address ? `Address : ${order.customer.address}` : ''}</Text>
            <Text noMargin>{order?.customer?.email ? `Email : ${order.customer.email}` : ''}</Text>
            <Text noMargin>{order?.customer?.phone ? `Phone : ${order.customer.phone}` : ''}</Text>
          </View>
          <View style={styles.twoCol}>
            <Text noMargin>{order?.serial_no ? `Order Number : #CMC${order.serial_no}` : ''}</Text>
            <Text noMargin>
              {order?.order_type === 'regular' && order?.customer_order_no ? `Customer Order No : ${order.customer_order_no}` : ''}
            </Text>
            <Text noMargin>{`Invoice Date : ${formatDateTime(Date.now())}`}</Text>
            <Text noMargin>{`Amount : ${formatMoney(order?.total_amount || 0, currency)}`}</Text>
          </View>
        </Section>

        <Section>
          <Table variant="grid" zebraStripe>
            <TableHeader>
              <TableRow header>
                <TableCell>Charges</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="center">Rate</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(order?.revenue_items || []).map((r: any, idx: number) => (
                <TableRow key={`${idx}-${r?.revenue_item || ''}`}>
                  <TableCell>{r?.revenue_item || ''}</TableCell>
                  <TableCell>{r?.note || ''}</TableCell>
                  <TableCell align="center">{`${formatMoney(r?.rate || 0, currency)} x ${r?.quantity || 0}`}</TableCell>
                  <TableCell align="right">{formatMoney((r?.rate || 0) * (r?.quantity || 0), currency)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>{''}</TableCell>
                <TableCell>{''}</TableCell>
                <TableCell align="center">
                  <Text noMargin style={{ fontWeight: theme.primitives.fontWeights.bold }}>
                    Total
                  </Text>
                </TableCell>
                <TableCell align="right">
                  <Text noMargin style={{ fontWeight: theme.primitives.fontWeights.bold }}>
                    {formatMoney(order?.total_amount || 0, currency)}
                  </Text>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        {order?.created_by ? (
          <Section noWrap>
            <Text color="accent" style={{ fontWeight: theme.primitives.fontWeights.bold }} transform="uppercase" noMargin>
              Processed By
            </Text>
            <View style={{ flexDirection: 'row', gap: theme.primitives.spacing[6] }} wrap={false}>
              <View style={{ flex: 1 }}>
                <Text noMargin>
                  {`Employee Name : ${order?.created_by?.name ? order.created_by.name : 'N/A'}`}
                </Text>
                <Text noMargin>{`Employee ID : ${order?.created_by?.corporateID || 'N/A'}`}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text noMargin>{`Email : ${order?.created_by?.email || ''}`}</Text>
                <Text noMargin>{`Phone : ${order?.created_by?.phone || 'N/A'}`}</Text>
              </View>
            </View>
          </Section>
        ) : null}

        {(order?.shipping_details || []).map((s: any, shippingIndex: number) => (
          <Section key={`${shippingIndex}-${s?.id || ''}`}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }} wrap={false}>
              {order?.serial_no ? <Text noMargin style={styles.badge as Style}>{`Order #CMC${order.serial_no}`}</Text> : null}
              {s?.commodity?.value || s?.commodity ? (
                <Text noMargin>{`Commodity : ${s?.commodity?.value || s?.commodity}`}</Text>
              ) : null}
              {s?.reference ? <Text noMargin>{`Commodity Reference : ${s.reference}`}</Text> : null}
              {s?.equipment?.value ? <Text noMargin>{`Equipments : ${s.equipment.value}`}</Text> : null}
              {s?.weight ? <Text noMargin>{`Weight : ${s.weight}${s?.weight_unit || ''}`}</Text> : null}
            </View>

            <View style={{ marginTop: theme.primitives.spacing[4] }}>
              {(s?.locations || []).map((l: any, idx: number) => {
                const isPickup = l?.type === 'pickup';
                const title = isPickup ? 'PICK' : 'STOP';
                return (
                  <View
                    key={`${idx}-${l?.referenceNo || ''}`}
                    style={[
                      styles.pill,
                      isPickup ? styles.pickPill : styles.stopPill,
                    ] as unknown as Style}
                    wrap={false}
                  >
                    <Text
                      noMargin
                      style={{
                        fontWeight: theme.primitives.fontWeights.bold,
                        color: isPickup ? theme.colors.accent : theme.colors.destructive,
                      }}
                    >
                      {title}
                    </Text>
                    <Text noMargin>{l?.location || ''}</Text>
                    <Text noMargin>{l?.date ? formatDateTime(l.date) : ''}</Text>
                    {l?.appointment ? <Text noMargin>{`Appointment : ${l.appointment}`}</Text> : null}
                    {l?.referenceNo ? <Text noMargin>{`Ref # : ${l.referenceNo}`}</Text> : null}
                  </View>
                );
              })}
            </View>
          </Section>
        ))}

        <Section noWrap>
          <Text noMargin>{'Please send remittance to - '}</Text>
          {mailToHref ? (
            <Link src={mailToHref} style={{ color: theme.colors.accent, fontSize: theme.typography.body.fontSize }}>
              {mailTo}
            </Link>
          ) : null}
          {company?.remittance_secondary_email ? (
            <Text noMargin color="mutedForeground">
              {` (cc: ${company.remittance_secondary_email})`}
            </Text>
          ) : null}

          {order?.order_type !== 'regular' && (
            <>
              <Text
                style={{ fontWeight: theme.primitives.fontWeights.bold, marginTop: theme.primitives.spacing[4] }}
                color="accent"
                noMargin
              >
                {`NAME OF BANK :- ${company?.bank_name || 'ROYAL BANK OF CANADA'}`}
              </Text>

              <View style={styles.bankBox} wrap={false}>
                <KeyValue
                  size="sm"
                  divided
                  items={[
                    { key: 'Bank Name', value: company?.bank_name || '' },
                    { key: 'Account Name', value: company?.account_name || '' },
                    { key: 'Account Number', value: company?.account_number || '' },
                    { key: 'Routing Number', value: company?.routing_number || '' },
                  ]}
                />
              </View>
            </>
          )}
        </Section>

        <View style={styles.footer} fixed>
          <PdfText>{formatDateTime(issued)}</PdfText>
          <PdfText
            render={({ pageNumber, totalPages }) =>
              `INVOICE# ${invoiceNo || ''} must appear on all invoices • Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
