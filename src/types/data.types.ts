export type ClassStatus = "Scheduled" | "Full" | "Cancelled";
export interface FitnessClass {
    id: string;
    name: string;
    instructor: string;
    room: string;
    time: Date;
    capacity: number;
    attendeeCount: number;
    status: ClassStatus;
    attendees?: Attendee[];
}

export type PaymentType = "One-time" | "Package" | "Membership";
export type BookingStatus = "Booked" | "Checked-in" | "Cancelled" | "No-show";
export interface Attendee {
    id: string;
    name: string;
    email: string;
    paymentType: PaymentType;
    bookingStatus: BookingStatus;
    bookedAt: Date;
}

export type StoreStatus = "Active" | "Inactive" | "Suspended";
export interface EcommerceStore {
    id: string;
    name: string;
    owner: string;
    location: string;
    category: string;
    createdAt: Date;
    productCount: number;
    totalStockValue: number;
    status: StoreStatus;
    stocks?: Stock[];
}

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock" | "Discontinued";
export interface Stock {
    id: string;
    sku: string;
    productName: string;
    category: string;
    price: number;
    quantity: number;
    status: StockStatus;
    updatedAt: Date;
}
