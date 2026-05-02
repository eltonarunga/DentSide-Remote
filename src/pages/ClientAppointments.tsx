import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import { apiRequest, type Appointment } from '../lib/api';

type AppointmentActionState = {
  appointmentId: string;
  action: 'cancel';
} | null;

export default function ClientAppointments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reason, setReason] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [actionState, setActionState] = useState<AppointmentActionState>(null);

  const selectedDentistId = searchParams.get('dentistId') || '';
  const selectedDentistName = searchParams.get('dentistName') || '';

  const loadAppointments = async () => {
    try {
      setError('');
      const data = await apiRequest<Appointment[]>('/api/appointments');
      setAppointments(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Unable to load appointments right now.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCreateAppointment = async () => {
    setError('');
    setStatusMessage('');

    if (reason.trim().length < 10) {
      setError('Please share a clear reason for the consult with at least 10 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        reason: reason.trim(),
        dentistId: selectedDentistId || undefined,
        dentistName: selectedDentistName || undefined,
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      };

      const created = await apiRequest<Appointment>('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setAppointments((current) => [created, ...current]);
      setReason('');
      setScheduledFor('');
      setStatusMessage(
        created.dentistName
          ? `Consult request sent to ${created.dentistName}.`
          : 'Consult request submitted successfully.',
      );

      if (selectedDentistId || selectedDentistName) {
        setSearchParams((current) => {
          const next = new URLSearchParams(current);
          next.delete('dentistId');
          next.delete('dentistName');
          return next;
        });
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Unable to create the appointment right now.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setActionState({ appointmentId, action: 'cancel' });
    setError('');
    setStatusMessage('');

    try {
      const updated = await apiRequest<Appointment>(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId ? updated : appointment,
        ),
      );
      setStatusMessage('Appointment cancelled successfully.');
    } catch (actionError) {
      const message =
        actionError instanceof Error
          ? actionError.message
          : 'Unable to cancel the appointment right now.';
      setError(message);
    } finally {
      setActionState(null);
    }
  };

  return (
    <ClientLayout title="Appointments">
      {/* Header Section */}
      <div className="mb-10">
        <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">Scheduling Hub</span>
        <h1 className="text-4xl lg:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-4">My Consultations</h1>
        <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">Send a new consult request, track scheduling updates, and manage your clinical queue.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          {/* Request Form Card */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-headline text-xl font-bold text-on-surface">Request a Consult</h3>
                <p className="text-sm text-on-surface-variant font-medium">Connect directly with the verified dentist network.</p>
              </div>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Live API</span>
            </div>

            <div className="space-y-6">
              {selectedDentistName ? (
                <div className="flex items-center justify-between gap-4 p-4 bg-primary-container/10 border border-primary/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">person_check</span>
                    <div>
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-0.5">Selected Specialist</p>
                      <p className="text-sm font-bold text-on-surface">{selectedDentistName}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] font-bold text-primary hover:underline"
                    onClick={() => {
                      setSearchParams((current) => {
                        const next = new URLSearchParams(current);
                        next.delete('dentistId');
                        next.delete('dentistName');
                        return next;
                      });
                    }}
                  >
                    Change
                  </button>
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Reason for Consult</label>
                <textarea
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  rows={4}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Describe the clinical case, symptoms, or secondary review required..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Preferred Time (Optional)</label>
                  <input
                    type="datetime-local"
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                    value={scheduledFor}
                    onChange={(event) => setScheduledFor(event.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    className="w-full primary-gradient text-white font-bold h-[52px] rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
                    onClick={handleCreateAppointment}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span className="material-symbols-outlined text-sm">send</span>}
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-error-container/20 text-error rounded-xl text-sm font-bold flex items-center gap-2 border border-error/10">
              <span className="material-symbols-outlined">error</span> {error}
            </div>
          )}

          {statusMessage && (
            <div className="p-4 bg-primary-container/10 text-primary rounded-xl text-sm font-bold flex items-center gap-2 border border-primary/20">
              <span className="material-symbols-outlined">check_circle</span> {statusMessage}
            </div>
          )}

          {/* Queue List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-surface-container-lowest rounded-xl editorial-shadow">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-slate-500 font-medium font-headline">Loading consult queue...</p>
              </div>
            ) : appointments.length > 0 ? (
              <div className="grid gap-4">
                {appointments.map((appointment) => {
                  const isCancelling = actionState?.appointmentId === appointment.id;
                  const canCancel = appointment.status === 'requested' || appointment.status === 'confirmed';

                  return (
                    <div key={appointment.id} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-transparent hover:border-primary/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 group">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-primary shrink-0 ${
                          appointment.status === 'completed' ? 'bg-primary/5' : 'bg-surface-container-low'
                        }`}>
                          <span className="material-symbols-outlined">
                            {appointment.status === 'completed' ? 'task_alt' : 'schedule'}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">
                              {appointment.dentistName || 'Pending Assignment'}
                            </h4>
                            <StatusBadge status={appointment.status} />
                          </div>
                          <p className="text-xs text-on-surface-variant font-medium leading-relaxed max-w-md">
                            {appointment.reason}
                          </p>
                          <div className="flex gap-4 mt-2">
                            <p className="text-[10px] text-outline font-bold uppercase tracking-wider">
                              Requested: {formatDate(appointment.createdAt)}
                            </p>
                            {appointment.scheduledFor && (
                              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                                Scheduled: {formatDate(appointment.scheduledFor)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {canCancel && (
                        <button
                          type="button"
                          className="px-4 py-2 border border-error/20 text-error text-[10px] font-bold rounded-lg hover:bg-error-container/10 transition-all uppercase tracking-widest flex items-center gap-2"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          disabled={isCancelling}
                        >
                          {isCancelling ? <Loader2 size={12} className="animate-spin" /> : <span className="material-symbols-outlined text-sm">cancel</span>}
                          Cancel
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-surface-container-lowest rounded-xl editorial-shadow border border-outline-variant/30">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">event_busy</span>
                <h3 className="text-xl font-bold text-on-surface mb-2">No Appointments Yet</h3>
                <p className="text-on-surface-variant max-w-sm mx-auto">Your consultation queue is empty. Find a clinical specialist to request your first teledentistry session.</p>
                <div className="mt-8 flex justify-center gap-4">
                  <Link to="/client/network" className="bg-primary text-on-primary px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">Find Specialists</Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Guidelines */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <div className="p-8 rounded-xl bg-surface-container-low shadow-sm space-y-6">
            <h2 className="text-lg font-bold tracking-tight font-headline">Clinical Flow</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="text-xs font-bold text-on-surface mb-1">Send Request</p>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">Provide context and your clinical needs. You can choose a specific doctor or leave it open for matches.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="text-xs font-bold text-on-surface mb-1">Doctor Review</p>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">The practitioner will review your case and confirm a clinical slot or request more information.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="text-xs font-bold text-on-surface mb-1">Consultation</p>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">Access your secure session and collaborate on the dental case through our clinical workspace.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-xl bg-primary text-on-primary shadow-xl space-y-4">
            <h3 className="text-lg font-bold font-headline">Need Urgent Care?</h3>
            <p className="text-sm opacity-90 leading-relaxed">Use our global directory to find specialists currently marked as 'Online' for immediate triage.</p>
            <Link to="/client/network" className="block w-full py-3 bg-white text-primary text-center text-xs font-bold rounded-xl uppercase tracking-widest hover:bg-primary-container hover:text-on-primary transition-all">Go to Network</Link>
          </div>
        </aside>
      </div>
    </ClientLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isTerminal = status === 'completed' || status === 'cancelled';
  const isConfirmed = status === 'confirmed';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
      isConfirmed ? 'bg-primary-fixed text-primary' :
      status === 'completed' ? 'bg-primary/10 text-primary' :
      status === 'cancelled' ? 'bg-error-container text-error' :
      'bg-tertiary-fixed text-tertiary'
    }`}>
      {status}
    </span>
  );
}

function formatDate(value?: string) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}
