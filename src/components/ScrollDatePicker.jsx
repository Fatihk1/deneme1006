import React, { useState } from 'react';
import DatePicker from 'react-mobile-datepicker';

const dateConfig = {
  year: { format: 'YYYY', caption: 'Yıl', step: 1 },
  month: { format: 'MM', caption: 'Ay', step: 1 },
  date: { format: 'DD', caption: 'Gün', step: 1 }
};

const ScrollDatePicker = ({ name, value, onChange, disabled, className }) => {
  const [open, setOpen] = useState(false);
  const handleSelect = (time) => {
    setOpen(false);
    onChange({ target: { name, value: time.toISOString().slice(0, 10) } });
  };
  const handleCancel = () => setOpen(false);

  return (
    <>
      <input
        type="text"
        name={name}
        value={value}
        readOnly
        disabled={disabled}
        className={className}
        onClick={() => !disabled && setOpen(true)}
      />
      <DatePicker
        theme="ios"
        isOpen={open}
        dateConfig={dateConfig}
        value={value ? new Date(value) : new Date()}
        onSelect={handleSelect}
        onCancel={handleCancel}
        confirmText="Tamam"
        cancelText="İptal"
      />
    </>
  );
};

export default ScrollDatePicker;
