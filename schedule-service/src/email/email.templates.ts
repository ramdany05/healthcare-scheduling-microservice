type ScheduleCreatedParams = {
  customerName: string;
  customerEmail: string;
  objective: string;
  doctorName: string;
  scheduledAt: Date;
  location?: string; // opsional: nama klinik/ruang praktik
  notes?: string; // opsional: instruksi tambahan (misal: puasa 8 jam sebelum konsultasi)
};

type ScheduleCancelledParams = {
  customerName: string;
  customerEmail: string;
  objective: string;
  doctorName?: string;
  scheduledAt?: Date;
  reason?: string; // opsional: alasan pembatalan
};

const CLINIC_NAME = 'Healthcare Scheduling';
const SUPPORT_EMAIL = process.env.SMTP_USER || 'support@healthcare-scheduling.com';

function formatDateTime(date: Date) {
  return date.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
}

function emailWrapper(bodyHtml: string) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
    <div style="padding: 24px 0; text-align: center; border-bottom: 2px solid #0d9488;">
      <span style="font-size: 18px; font-weight: 700; color: #0d9488;">${CLINIC_NAME}</span>
    </div>
    <div style="padding: 32px 8px;">
      ${bodyHtml}
    </div>
    <div style="padding: 20px 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
      <p style="margin: 0 0 4px;">Email ini dikirim otomatis, mohon tidak membalas langsung.</p>
      <p style="margin: 0;">Butuh bantuan? Hubungi kami di ${SUPPORT_EMAIL}.</p>
    </div>
  </div>`;
}

function detailRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding: 6px 12px; color: #6b7280; font-size: 14px; white-space: nowrap;">${label}</td>
      <td style="padding: 6px 12px; color: #111827; font-size: 14px; font-weight: 600;">${value}</td>
    </tr>`;
}

export function scheduleCreatedEmail(params: ScheduleCreatedParams) {
  const dateTime = formatDateTime(params.scheduledAt);

  const rows = [
    detailRow('Tujuan', params.objective),
    detailRow('Dokter', params.doctorName),
    detailRow('Waktu', dateTime),
    params.location ? detailRow('Lokasi', params.location) : '',
  ].join('');

  const html = emailWrapper(`
    <p style="font-size: 15px; margin: 0 0 16px;">Halo ${params.customerName},</p>
    <p style="font-size: 15px; margin: 0 0 20px;">
      Jadwal konsultasi Anda telah <strong>berhasil dibuat</strong>. Berikut rinciannya:
    </p>
    <table style="width: 100%; background: #f9fafb; border-radius: 8px; border-collapse: collapse; margin-bottom: 20px;">
      ${rows}
    </table>
    ${
      params.notes
        ? `<p style="font-size: 14px; background: #fff7ed; border-left: 3px solid #f97316; padding: 10px 12px; margin: 0 0 20px;">
             <strong>Catatan:</strong> ${params.notes}
           </p>`
        : ''
    }
    <p style="font-size: 15px; margin: 0;">
      Mohon hadir 10–15 menit sebelum jadwal untuk proses administrasi. Terima kasih atas kepercayaan Anda.
    </p>
  `);

  const text = [
    `Halo ${params.customerName},`,
    '',
    'Jadwal konsultasi Anda telah berhasil dibuat dengan detail berikut:',
    '',
    `  Tujuan : ${params.objective}`,
    `  Dokter : ${params.doctorName}`,
    `  Waktu  : ${dateTime}`,
    params.location ? `  Lokasi : ${params.location}` : '',
    '',
    params.notes ? `Catatan: ${params.notes}` : '',
    params.notes ? '' : '',
    'Mohon hadir 10-15 menit sebelum jadwal untuk proses administrasi.',
    '',
    `Butuh bantuan? Hubungi kami di ${SUPPORT_EMAIL}.`,
    '',
    'Terima kasih,',
    CLINIC_NAME,
  ]
    .filter((line, i, arr) => !(line === '' && arr[i - 1] === '')) // rapikan baris kosong ganda
    .join('\n');

  return {
    to: params.customerEmail,
    subject: `Jadwal Konsultasi Dikonfirmasi — ${dateTime}`,
    text,
    html,
  };
}

export function scheduleCancelledEmail(params: ScheduleCancelledParams) {
  const rows = [
    detailRow('Tujuan', params.objective),
    params.doctorName ? detailRow('Dokter', params.doctorName) : '',
    params.scheduledAt ? detailRow('Waktu semula', formatDateTime(params.scheduledAt)) : '',
  ].join('');

  const html = emailWrapper(`
    <p style="font-size: 15px; margin: 0 0 16px;">Halo ${params.customerName},</p>
    <p style="font-size: 15px; margin: 0 0 20px;">
      Kami informasikan bahwa jadwal konsultasi Anda berikut telah <strong>dibatalkan</strong>:
    </p>
    <table style="width: 100%; background: #f9fafb; border-radius: 8px; border-collapse: collapse; margin-bottom: 20px;">
      ${rows}
    </table>
    ${
      params.reason
        ? `<p style="font-size: 14px; background: #fef2f2; border-left: 3px solid #ef4444; padding: 10px 12px; margin: 0 0 20px;">
             <strong>Alasan pembatalan:</strong> ${params.reason}
           </p>`
        : ''
    }
    <p style="font-size: 15px; margin: 0;">
      Jika Anda ingin membuat jadwal baru atau memiliki pertanyaan, silakan hubungi kami.
    </p>
  `);

  const text = [
    `Halo ${params.customerName},`,
    '',
    'Kami informasikan bahwa jadwal konsultasi Anda berikut telah dibatalkan:',
    '',
    `  Tujuan : ${params.objective}`,
    params.doctorName ? `  Dokter : ${params.doctorName}` : '',
    params.scheduledAt ? `  Waktu semula : ${formatDateTime(params.scheduledAt)}` : '',
    '',
    params.reason ? `Alasan pembatalan: ${params.reason}` : '',
    params.reason ? '' : '',
    'Jika Anda ingin membuat jadwal baru atau memiliki pertanyaan, silakan hubungi kami.',
    '',
    `Kontak: ${SUPPORT_EMAIL}.`,
    '',
    'Terima kasih,',
    CLINIC_NAME,
  ]
    .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
    .join('\n');

  return {
    to: params.customerEmail,
    subject: 'Jadwal Konsultasi Dibatalkan',
    text,
    html,
  };
}