import { useState } from 'react';
import { site } from '../data/site';
import { guestOptions, sittingOptions } from '../data/content';

const initialState = {
  name: '',
  guests: guestOptions[0],
  date: '',
  time: sittingOptions[0],
  message: '',
};

/**
 * Hands the booking off to WhatsApp with the details pre-filled — nothing
 * is transmitted until the guest presses send inside WhatsApp itself.
 */
export function ReservationForm() {
  const [values, setValues] = useState(initialState);

  const update = (field) => (event) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    const lines = [
      'Hello Hillsedge, I would like to reserve a table.',
      '',
      `Name: ${values.name.trim() || '—'}`,
      `Guests: ${values.guests}`,
      `Date: ${values.date || '—'}`,
      `Sitting: ${values.time}`,
    ];
    if (values.message.trim()) lines.push(`Notes: ${values.message.trim()}`);

    window.open(
      `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`,
      '_blank',
      'noopener'
    );
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="rname">Name</label>
        <input
          id="rname"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={values.name}
          onChange={update('name')}
        />
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
        <input id="rdate" type="date" value={values.date} onChange={update('date')} />
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
