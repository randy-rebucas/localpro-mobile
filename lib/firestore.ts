import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Service {
  id?: string;
  name: string;
  icon: string;
  rating: number;
  providers: number;
  color: string;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Provider {
  id?: string;
  name: string;
  service: string;
  rating: number;
  reviews: number;
  avatar: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface User {
  id?: string;
  email: string;
  name?: string;
  phone?: string;
  avatar?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Booking {
  id?: string;
  userId: string;
  providerId: string;
  serviceId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledDate: Date;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Review {
  id?: string;
  userId: string;
  providerId: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt?: any;
}

export interface Message {
  id?: string;
  userId: string;
  providerId: string;
  content: string;
  sender: 'user' | 'provider';
  read: boolean;
  createdAt?: any;
}

export interface Conversation {
  id?: string;
  userId: string;
  providerId: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  createdAt?: any;
  updatedAt?: any;
}

// Services Collection
export const servicesCollection = collection(db, 'services');
export const providersCollection = collection(db, 'providers');
export const usersCollection = collection(db, 'users');
export const bookingsCollection = collection(db, 'bookings');
export const reviewsCollection = collection(db, 'reviews');
export const messagesCollection = collection(db, 'messages');
export const conversationsCollection = collection(db, 'conversations');

// Service Operations
export const getServices = async (): Promise<Service[]> => {
  try {
    const querySnapshot = await getDocs(servicesCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Service[];
  } catch (error) {
    console.error('Error getting services:', error);
    throw error;
  }
};

export const getServicesWithProviders = async (): Promise<Service[]> => {
  try {
    // First get all services
    const servicesSnapshot = await getDocs(servicesCollection);
    const services = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Service[];

    // Get all providers to check which services have providers
    const providersSnapshot = await getDocs(providersCollection);
    const providers = providersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Provider[];

    // Create a set of service names that have providers
    const servicesWithProviders = new Set(
      providers.map(provider => provider.service)
    );

    // Filter services to only include those that have providers
    const filteredServices = services.filter(service => 
      servicesWithProviders.has(service.name)
    );

    // Update the providers count for each service
    const servicesWithProviderCount = filteredServices.map(service => {
      const providerCount = providers.filter(provider => 
        provider.service === service.name
      ).length;
      
      return {
        ...service,
        providers: providerCount
      };
    });

    return servicesWithProviderCount;
  } catch (error) {
    console.error('Error getting services with providers:', error);
    throw error;
  }
};

export const getServiceById = async (id: string): Promise<Service | null> => {
  try {
    const docRef = doc(db, 'services', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Service;
    }
    return null;
  } catch (error) {
    console.error('Error getting service:', error);
    throw error;
  }
};

export const addService = async (service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(servicesCollection, {
      ...service,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding service:', error);
    throw error;
  }
};

// Provider Operations
export const getProviders = async (): Promise<Provider[]> => {
  try {
    const querySnapshot = await getDocs(providersCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Provider[];
  } catch (error) {
    console.error('Error getting providers:', error);
    throw error;
  }
};

export const getProvidersByService = async (serviceId: string): Promise<Provider[]> => {
  try {
    const q = query(
      providersCollection,
      where('serviceId', '==', serviceId),
      orderBy('rating', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Provider[];
  } catch (error) {
    console.error('Error getting providers by service:', error);
    throw error;
  }
};

export const getTopProviders = async (limitCount: number = 4): Promise<Provider[]> => {
  try {
    const q = query(
      providersCollection,
      orderBy('rating', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Provider[];
  } catch (error) {
    console.error('Error getting top providers:', error);
    throw error;
  }
};

// User Operations
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(usersCollection, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<void> => {
  try {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Booking Operations
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const q = query(
      bookingsCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Booking[];
  } catch (error) {
    console.error('Error getting user bookings:', error);
    throw error;
  }
};

export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(bookingsCollection, {
      ...booking,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const updateBookingStatus = async (id: string, status: Booking['status']): Promise<void> => {
  try {
    const docRef = doc(db, 'bookings', id);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Review Operations
export const getProviderReviews = async (providerId: string): Promise<Review[]> => {
  try {
    const q = query(
      reviewsCollection,
      where('providerId', '==', providerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error getting provider reviews:', error);
    throw error;
  }
};

export const createReview = async (review: Omit<Review, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(reviewsCollection, {
      ...review,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const getAllReviews = async (): Promise<Review[]> => {
  try {
    const q = query(
      reviewsCollection,
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  } catch (error) {
    console.error('Error getting all reviews:', error);
    throw error;
  }
};

export const getReviewsWithProviderInfo = async (): Promise<any[]> => {
  try {
    // Get all reviews
    const reviewsSnapshot = await getDocs(reviewsCollection);
    const reviews = reviewsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];

    // Get all providers to match with reviews
    const providersSnapshot = await getDocs(providersCollection);
    const providers = providersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Provider[];

    // Get all users to match with reviews
    const usersSnapshot = await getDocs(usersCollection);
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];

    // Combine review data with provider and user information
    const reviewsWithInfo = reviews.map(review => {
      const provider = providers.find(p => p.id === review.providerId);
      const user = users.find(u => u.id === review.userId);
      
      return {
        id: review.id,
        provider: provider?.name || 'Unknown Provider',
        service: provider?.service || 'Unknown Service',
        rating: review.rating,
        review: review.comment,
        date: review.createdAt ? new Date(review.createdAt.toDate()).toLocaleDateString() : 'Unknown date',
        avatar: provider?.name ? provider.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'UP',
        verified: true, // You can add verification logic here
        helpful: Math.floor(Math.random() * 20) + 1, // Mock helpful count for now
        providerId: review.providerId,
        userId: review.userId,
        bookingId: review.bookingId
      };
    });

         return reviewsWithInfo;
   } catch (error) {
     console.error('Error getting reviews with provider info:', error);
     throw error;
   }
 };

// Message Operations
export const getUserConversations = async (userId: string): Promise<any[]> => {
  try {
    const q = query(
      conversationsCollection,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Conversation[];

    // Get all providers to match with conversations
    const providersSnapshot = await getDocs(providersCollection);
    const providers = providersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Provider[];

    // Combine conversation data with provider information
    const conversationsWithInfo = conversations.map(conversation => {
      const provider = providers.find(p => p.id === conversation.providerId);
      
      return {
        id: conversation.id,
        provider: provider?.name || 'Unknown Provider',
        service: provider?.service || 'Unknown Service',
        lastMessage: conversation.lastMessage,
        time: conversation.lastMessageTime ? formatTimeAgo(conversation.lastMessageTime.toDate()) : 'Unknown time',
        unread: conversation.unreadCount > 0,
        avatar: provider?.name ? provider.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'UP',
        online: Math.random() > 0.5, // Mock online status for now
        messageCount: conversation.unreadCount,
        providerId: conversation.providerId,
        userId: conversation.userId
      };
    });

    return conversationsWithInfo;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const q = query(
      messagesCollection,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
};

export const sendMessage = async (message: Omit<Message, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(messagesCollection, {
      ...message,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'messages', messageId);
    await updateDoc(docRef, {
      read: true
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString();
};
