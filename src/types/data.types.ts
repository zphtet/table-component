export type ClassStatus = 'Scheduled' | 'Full' | 'Cancelled'
export interface FitnessClass {
  id: string
  name: string
  instructor: string
  room: string
  /** When the class starts */
  time: Date
  capacity: number
  attendeeCount: number
  status: ClassStatus
  attendees?: Attendee[]
}

export type PaymentType = 'One-time' | 'Package' | 'Membership'
export type BookingStatus = 'Booked' | 'Checked-in' | 'Cancelled' | 'No-show'
export interface Attendee {
  id: string
  name: string
  email: string
  paymentType: PaymentType
  bookingStatus: BookingStatus
  bookedAt: Date
}

export type MemberPlan = 'Monthly' | 'Annual' | 'Class pack' | 'Drop-in'
export type MemberStatus = 'Active' | 'Paused' | 'Expired'
export interface Member {
  id: string
  name: string
  email: string
  phone: string
  plan: MemberPlan
  status: MemberStatus
  homeStudio: string
  joinedAt: Date
  lastVisit: Date | null
  visits: number
  /** In dollars */
  lifetimeSpend: number
}