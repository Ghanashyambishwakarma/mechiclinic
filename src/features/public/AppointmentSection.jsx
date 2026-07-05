import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { createDocument } from '../../lib/firestore';
import { COLLECTIONS, APPOINTMENT_STATUS } from '../../lib/constants';
import { useCollection } from '../../hooks/useCollection';
import Input, { Textarea, Select } from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const AppointmentSection = () => {
  const [loading, setLoading] = useState(false);
  const { data: doctors } = useCollection(COLLECTIONS.DOCTORS, 'name', 'asc');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await createDocument(COLLECTIONS.APPOINTMENTS, {
        ...data,
        status: APPOINTMENT_STATUS.PENDING,
      });
      toast.success('Appointment booked successfully! We will contact you soon.');
      reset();
    } catch (error) {
      toast.error('Failed to book appointment. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const doctorOptions = [
    { value: '', label: 'Select Doctor (Optional)' },
    ...doctors.map((d) => ({ value: d.id, label: `${d.name} - ${d.department}` })),
  ];

  return (
    <section id="appointment" className="py-24 gradient-bg-soft">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-clinic-teal dark:text-primary-400 font-semibold text-sm uppercase tracking-wider">
            Book Now
          </span>
          <h2 className="section-title mt-2 mb-4">Book an Appointment</h2>
          <p className="section-subtitle mx-auto">
            Schedule your visit with our expert doctors. We&apos;ll confirm your appointment shortly.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit(onSubmit)}
          className="glass-strong p-8 space-y-6"
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <Input
              label="Full Name *"
              icon={User}
              {...register('patientName', { required: 'Name is required' })}
              error={errors.patientName?.message}
            />
            <Input
              label="Phone Number *"
              icon={Phone}
              type="tel"
              {...register('phone', { required: 'Phone is required' })}
              error={errors.phone?.message}
            />
            <Input
              label="Email"
              icon={Mail}
              type="email"
              {...register('email')}
            />
            <Select
              label="Preferred Doctor"
              options={doctorOptions}
              {...register('doctorId')}
            />
            <Input
              label="Preferred Date *"
              icon={Calendar}
              type="date"
              {...register('date', { required: 'Date is required' })}
              error={errors.date?.message}
            />
            <Input
              label="Preferred Time *"
              icon={Clock}
              type="time"
              {...register('time', { required: 'Time is required' })}
              error={errors.time?.message}
            />
          </div>
          <Textarea
            label="Additional Notes"
            icon={MessageSquare}
            placeholder="Describe your symptoms or reason for visit..."
            {...register('notes')}
          />
          <Button type="submit" loading={loading} className="w-full sm:w-auto">
            Book Appointment
          </Button>
        </motion.form>
      </div>
    </section>
  );
};

export default AppointmentSection;
