import React, { useState, useEffect } from 'react';
import Picker from 'react-mobile-picker';

const years = Array.from({ length: 101 }, (_, i) => String(1970 + i));
const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

function getDays(year, month) {
  return Array.from(
    { length: new Date(Number(year), Number(month), 0).getDate() },
    (_, i) => String(i + 1).padStart(2, '0')
  );
}

const ScrollDatePicker = ({ name, value, onChange, disabled, className }) => {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState({ year: '', month: '', day: '' });

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-');
      setVal({ year: y, month: m, day: d });
    } else {
      const now = new Date();
      setVal({
        year: String(now.getFullYear()),
        month: String(now.getMonth() + 1).padStart(2, '0'),
        day: String(now.getDate()).padStart(2, '0')
      });
    }
  }, [value]);

  const handleChange = (v, key) => {
    const next = { ...val, [key]: v };
    if (key === 'year' || key === 'month') {
      const days = new Date(Number(next.year), Number(next.month), 0).getDate();
      if (Number(next.day) > days) {
        next.day = String(days).padStart(2, '0');
      }
    }
    setVal(next);
  };

  const handleConfirm = () => {
    onChange({ target: { name, value: `${val.year}-${val.month}-${val.day}` } });
    setOpen(false);
  };

  const days = getDays(val.year, val.month);

  return (
    <div className="relative">
      <input
        type="text"
        name={name}
        value={`${val.year}-${val.month}-${val.day}`}
        readOnly
        disabled={disabled}
        className={className}
        onClick={() => !disabled && setOpen(true)}
      />
      {open && (
        <div className="absolute z-50 bg-white border rounded-lg shadow p-4 mt-1">
          <Picker value={val} onChange={handleChange} wheelMode="natural">
            <Picker.Column name="year">
              {years.map((y) => (
                <Picker.Item key={y} value={y}>
                  {y}
                </Picker.Item>
              ))}
            </Picker.Column>
            <Picker.Column name="month">
              {months.map((m) => (
                <Picker.Item key={m} value={m}>
                  {m}
                </Picker.Item>
              ))}
            </Picker.Column>
            <Picker.Column name="day">
              {days.map((d) => (
                <Picker.Item key={d} value={d}>
                  {d}
                </Picker.Item>
              ))}
            </Picker.Column>
          </Picker>
          <div className="flex justify-end gap-2 mt-2 text-sm">
            <button type="button" onClick={() => setOpen(false)}>
              İptal
            </button>
            <button type="button" onClick={handleConfirm} className="font-semibold text-blue-600">
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrollDatePicker;
