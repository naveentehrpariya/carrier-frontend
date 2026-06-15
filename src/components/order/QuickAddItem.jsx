import React, { useContext, useState } from 'react';
import Popup from '../../pages/common/Popup';
import toast from 'react-hot-toast';
import Api from '../../api/Api';
import { UserContext } from '../../context/AuthProvider';
import { ModalShell, ModalHeader, FormSection, Field, TextInput, ModalFooter } from '../modal/ModalKit';

/**
 * Single-field quick-add modal for tenant settings items (equipment, charge items)
 * that the backend creates from a plain `{ value }` body.
 * onAdded(value, data) fires on success — `data` is the created doc when the API returns one.
 */
export default function QuickAddItem({ endpoint, title, subtitle, label, icon, accent = '#a091ff', classes, text, onAdded }) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [action, setaction] = useState();
  const { Errors } = useContext(UserContext);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error(`${label} is required.`);
      return;
    }
    setLoading(true);
    Api.post(endpoint, { value: trimmed }).then((res) => {
      setLoading(false);
      if (res.data.status === true) {
        toast.success(res.data.message);
        onAdded && onAdded(trimmed, res.data.data);
        setValue('');
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
        <FormSection title={label}>
          <Field full label={label} required>
            <TextInput
              value={value}
              onChange={(e) => setValue(e.target.value)}
              type="text"
              placeholder={`Enter ${label.toLowerCase()}`}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
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
