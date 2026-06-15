import React, { useContext, useState } from 'react';
import Popup from '../../pages/common/Popup';
import toast from 'react-hot-toast';
import Api from '../../api/Api';
import { UserContext } from '../../context/AuthProvider';
import { ModalShell, ModalHeader, FormSection, Field, TextInput, ModalFooter } from '../modal/ModalKit';

/**
 * Quick-add modal for fleet assets (truck, trailer) that the backend creates from a
 * `{ plateNumber, unitNumber }` body. Captures just the essentials; full details are
 * edited later on the fleet page.
 * onAdded(doc) fires on success with the created document (res.data[docKey]).
 */
export default function QuickAddAsset({ endpoint, docKey, title, subtitle, icon, accent = '#a091ff', classes, text, onAdded }) {
  const [data, setData] = useState({ plateNumber: '', unitNumber: '' });
  const [loading, setLoading] = useState(false);
  const [action, setaction] = useState();
  const { Errors } = useContext(UserContext);

  const submit = () => {
    if (!data.plateNumber.trim()) {
      toast.error('Plate number is required.');
      return;
    }
    setLoading(true);
    const body = { plateNumber: data.plateNumber.trim(), unitNumber: data.unitNumber.trim() };
    Api.post(endpoint, body).then((res) => {
      setLoading(false);
      if (res.data.status === true) {
        toast.success(res.data.message);
        onAdded && onAdded(res.data[docKey]);
        setData({ plateNumber: '', unitNumber: '' });
        setaction('close');
        setTimeout(() => setaction(), 600);
      } else {
        toast.error(res.data.message);
      }
    }).catch((err) => {
      setLoading(false);
      Errors(err);
    });
  };

  return (
    <Popup action={action} size="md:max-w-md" space="p-0" bg="bg-black" btnclasses={classes} btntext={text}>
      <ModalShell accent={accent}>
        <ModalHeader icon={icon} accent={accent} title={title} subtitle={subtitle} />
        <FormSection title="Details" cols={2}>
          <Field label="Plate number" required>
            <TextInput
              value={data.plateNumber}
              onChange={(e) => setData((p) => ({ ...p, plateNumber: e.target.value }))}
              type="text"
              placeholder="e.g. AB-1234"
            />
          </Field>
          <Field label="Unit number">
            <TextInput
              value={data.unitNumber}
              onChange={(e) => setData((p) => ({ ...p, unitNumber: e.target.value }))}
              type="text"
              placeholder="Optional"
            />
          </Field>
        </FormSection>
        <ModalFooter
          accent={accent}
          onCancel={() => { setaction('close'); setTimeout(() => setaction(), 300); }}
          onSubmit={submit}
          loading={loading}
          loadingLabel="Adding…"
          submitLabel="Add"
        />
      </ModalShell>
    </Popup>
  );
}
