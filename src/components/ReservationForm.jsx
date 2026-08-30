import { useMemo, useRef, useState } from 'react';
import { site } from '../data/site';
import { guestOptions, sittingOptions } from '../data/content';

const initialState = {
  name: '',
  guests: guestOptions[0],
  date: '',
  time: sittingOptions[0],
  message: '',
};

/** Local calendar date as `YYYY-MM-DD` — `toISOString` would shift the day. */
function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * A booking is only useful to the kitchen with a name and a day against it,
 * and a date in the past is always a slip rather than an intent.
 */
function validate(values, minDate) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Please tell us who the table is for.';
  if (!values.date) errors.date = 'Please choose a date.';
  else if (values.date < minDate) errors.date = 'Please choose today or a later date.';
  return errors;
}

/**
 * Hands the booking off to WhatsApp with the details pre-filled — nothing
 * is transmitted until the guest presses send inside WhatsApp itself.
 */
export function ReservationForm() {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  // Errors appear on the first submit, not while the guest is still typing.
  const [submitted, setSubmitted] = useState(false);
  const minDate = useMemo(today, []);
  const fieldRefs = { name: useRef(null), date: useRef(null) };

  const shown = submitted ? errors : {};

  const update = (field) => (event) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    // Once errors are on screen, clear them as soon as the input is good.
    if (submitted) setErrors(validate(next, minDate));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);

    const found = validate(values, minDate);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      fieldRefs[found.name ? 'name' : 'date'].current?.focus();
      return;
    }

    const lines = [
      'Hello Hillsedge, I would like to reserve a table.',
      '',
      `Name: ${values.name.trim()}`,
      `Guests: ${values.guests}`,
      `Date: ${values.date}`,
      `Sitting: ${values.time}`,
    ];
    if (values.message.trim()) lines.push(`Notes: ${values.message.trim()}`);

    window.open(
      `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank',
      'noopener'
    );
  };

  /** Wires a field to its message so screen readers announce the two together. */
  const errorProps = (field) =>
    shown[field]
      ? { 'aria-invalid': 'true', 'aria-describedby': `${field}-error` }
      : {};

  const ErrorText = ({ field }) =>
    shown[field] ? (
      <span className="field-error" id={`${field}-error`} role="alert">
        {shown[field]}
      </span>
    ) : null;

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="rname">Name</label>
        <input
          id="rname"
          ref={fieldRefs.name}
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={values.name}
          onChange={update('name')}
          {...errorProps('name')}
        />
        <ErrorText field="name" />
      </div>

      <div className="field">
        <label htmlFor="rguests">Guests</label>
        <select id="rguests" value={values.guests} onChange={update('guests')}>
          {guestOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="rdate">Date</label>
        <input
          id="rdate"
          ref={fieldRefs.date}
          type="date"
          min={minDate}
          value={values.date}
          onChange={update('date')}
          {...errorProps('date')}
        />
        <ErrorText field="date" />
      </div>

      <div className="field">
        <label htmlFor="rtime">Time</label>
        <select id="rtime" value={values.time} onChange={update('time')}>
          {sittingOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className="field full">
        <label htmlFor="rmsg">Anything we should know</label>
        <textarea
          id="rmsg"
          placeholder="Dietary needs, occasion, tour group details…"
          value={values.message}
          onChange={update('message')}
        />
      </div>

      <div className="field full">
        <button type="submit" className="btn b-fill form-submit">
          Send on WhatsApp <i aria-hidden="true">&rarr;</i>
        </button>
      </div>

      <p className="form-note">
        Opens WhatsApp with your details filled in — nothing is sent until you press send there.
        Prefer email? Write to <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </form>
  );
}

export default ReservationForm;
