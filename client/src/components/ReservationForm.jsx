import { useMemo, useRef, useState } from 'react';
import { site } from '../data/site';
import { guestOptions, sittingOptions } from '../data/content';
import { createReservation } from '../api/client';

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
 * and a date in the past is always a slip rather than an intent. The server
 * enforces the same rules; this is here so the guest hears about it without
 * a round trip.
 */
function validate(values, minDate) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Please tell us who the table is for.';
  if (!values.date) errors.date = 'Please choose a date.';
  else if (values.date < minDate) errors.date = 'Please choose today or a later date.';
  return errors;
}

/** The message handed to WhatsApp, for the guests who would rather use it. */
function whatsappText(values) {
  const lines = [
    'Hello Hillsedge, I would like to reserve a table.',
    '',
    `Name: ${values.name.trim() || '—'}`,
    `Guests: ${values.guests}`,
    `Date: ${values.date || '—'}`,
    `Sitting: ${values.time}`,
  ];
  if (values.message.trim()) lines.push(`Notes: ${values.message.trim()}`);
  return lines.join('\n');
}

/**
 * Sends the booking to the kitchen.
 *
 * The request goes to our own API, so a booking is recorded whether or not
 * the guest completes anything else. WhatsApp stays as a second route: it is
 * how most people here prefer to talk to a restaurant, and it is the way out
 * if the server is unreachable.
 */
export function ReservationForm() {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  // Errors appear on the first submit, not while the guest is still typing.
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed
  const [failure, setFailure] = useState(null);
  const minDate = useMemo(today, []);
  const fieldRefs = { name: useRef(null), date: useRef(null) };

  const shown = submitted ? errors : {};

  const update = (field) => (event) => {
    const next = { ...values, [field]: event.target.value };
    setValues(next);
    if (submitted) setErrors(validate(next, minDate));
    // A new edit means the previous outcome no longer describes the form.
    if (status === 'failed') { setStatus('idle'); setFailure(null); }
  };

  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(whatsappText(values))}`,
      '_blank',
      'noopener'
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);

    const found = validate(values, minDate);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      fieldRefs[found.name ? 'name' : 'date'].current?.focus();
      return;
    }

    setStatus('sending');
    setFailure(null);

    try {
      await createReservation({
        name: values.name.trim(),
        guests: values.guests,
        date: values.date,
        time: values.time,
        message: values.message.trim(),
      });
      setStatus('sent');
    } catch (error) {
      // The server validates independently; if it disagrees, show its view.
      if (error.errors) {
        setErrors(error.errors);
        fieldRefs[error.errors.name ? 'name' : 'date']?.current?.focus();
      }
      setStatus('failed');
      setFailure(error.message);
    }
  };

  if (status === 'sent') {
    return (
      <div className="form form-sent" role="status">
        <span className="lab lab-glow">Request Received</span>
        <h3>Thank you, {values.name.trim()}.</h3>
        <p>
          We have your table request for {values.date}, {values.time.toLowerCase()}, for{' '}
          {values.guests} — and we&apos;ll confirm by message shortly.
        </p>
        <p className="form-note">
          Nothing to do now. If it is urgent, call{' '}
          <a href={site.phone.href}>{site.phone.label}</a> or send it on{' '}
          <button type="button" className="link-button" onClick={openWhatsApp}>
            WhatsApp
          </button>
          .
        </p>
      </div>
    );
  }

  /** Wires a field to its message so screen readers announce the two together. */
  const errorProps = (field) =>
    shown[field] ? { 'aria-invalid': 'true', 'aria-describedby': `${field}-error` } : {};

  const ErrorText = ({ field }) =>
    shown[field] ? (
      <span className="field-error" id={`${field}-error`} role="alert">
        {shown[field]}
      </span>
    ) : null;

  const sending = status === 'sending';

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
          disabled={sending}
          {...errorProps('name')}
        />
        <ErrorText field="name" />
      </div>

      <div className="field">
        <label htmlFor="rguests">Guests</label>
        <select id="rguests" value={values.guests} onChange={update('guests')} disabled={sending}>
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
          disabled={sending}
          {...errorProps('date')}
        />
        <ErrorText field="date" />
      </div>

      <div className="field">
        <label htmlFor="rtime">Time</label>
        <select id="rtime" value={values.time} onChange={update('time')} disabled={sending}>
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
          disabled={sending}
        />
      </div>

      {failure && (
        <p className="form-failure" role="alert">
          {failure}
        </p>
      )}

      <div className="field full">
        <button type="submit" className="btn b-fill form-submit" disabled={sending}>
          {sending ? 'Sending…' : 'Request a table'} <i aria-hidden="true">&rarr;</i>
        </button>
      </div>

      <div className="field full">
        <button type="button" className="btn b-ghost form-submit" onClick={openWhatsApp}>
          Send on WhatsApp instead
        </button>
      </div>

      <p className="form-note">
        We&apos;ll confirm by message — nothing is charged and nothing is held until we do.
        Prefer email? Write to <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </form>
  );
}

export default ReservationForm;
