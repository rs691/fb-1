import { firebaseConfig } from '@/lib/firebase/config';
import type { Event, Product, Project } from '@/types';
import { getApp, getApps, initializeApp } from 'firebase/app';
import type { User as FirebaseUser } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore, limit, query, setDoc } from 'firebase/firestore';
import { placeholderImages } from './placeholder-images.json';

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);


// Mock data as a fallback
const mockProducts: Product[] = [
  { id: '1', name: 'Handcrafted Oak Dining Table', description: 'A beautiful and sturdy dining table, perfect for family gatherings.', price: 1200, imageUrl: placeholderImages.find(p => p.id === 'product-1')?.imageUrl || '', imageHint: 'dining table', stock: 5 },
  { id: '2', name: 'Sleek Walnut Bookshelf', description: 'Modern and minimalist bookshelf to display your favorite reads.', price: 750, imageUrl: placeholderImages.find(p => p.id === 'product-2')?.imageUrl || '', imageHint: 'walnut bookshelf', stock: 10 },
  { id: '3', name: 'Elegant Cherry Wood Coffee Table', description: 'A centerpiece for your living room with a rich, warm finish.', price: 450, imageUrl: placeholderImages.find(p => p.id === 'product-3')?.imageUrl || '', imageHint: 'coffee table', stock: 8 },
  { id: '4', name: 'Rustic Pine Wood Bench', description: 'A charming bench that adds character to any entryway or garden.', price: 250, imageUrl: placeholderImages.find(p => p.id === 'product-4')?.imageUrl || '', imageHint: 'pine bench', stock: 12 },
  { id: '5', name: 'Modern Maple Wood Desk', description: 'A spacious and stylish desk for your home office.', price: 900, imageUrl: placeholderImages.find(p => p.id === 'product-5')?.imageUrl || '', imageHint: 'maple desk', stock: 7 },
  { id: '6', name: 'Hand-carved Wooden Bowls', description: 'Set of three decorative bowls, perfect for fruits or as standalone art pieces.', price: 120, imageUrl: placeholderImages.find(p => p.id === 'product-6')?.imageUrl || '', imageHint: 'wooden bowls', stock: 20 },
];

const mockProjects: Project[] = [
  { id: '1', title: 'Custom Kitchen Cabinetry', description: 'Complete kitchen renovation with solid oak cabinets and marble countertops.', imageUrl: placeholderImages.find(p => p.id === 'project-1')?.imageUrl || '', imageHint: 'custom kitchen' },
  { id: '2', title: 'Home Library Installation', description: 'Floor-to-ceiling walnut bookshelves for a cozy and elegant home library.', imageUrl: placeholderImages.find(p => p.id === 'project-2')?.imageUrl || '', imageHint: 'home library' },
  { id: '3', title: 'Outdoor Pergola and Deck', description: 'A beautiful cedar pergola and deck for outdoor entertaining.', imageUrl: placeholderImages.find(p => p.id === 'project-3')?.imageUrl || '', imageHint: 'outdoor pergola' },
  { id: '4', title: 'Spiral Wooden Staircase', description: 'A stunning and intricate spiral staircase made from reclaimed wood.', imageUrl: placeholderImages.find(p => p.id === 'project-4')?.imageUrl || '', imageHint: 'wooden staircase' },
  { id: '5', title: 'Bespoke Home Office', description: 'A complete home office solution with a custom desk, shelving, and storage.', imageUrl: placeholderImages.find(p => p.id === 'project-5')?.imageUrl || '', imageHint: 'home office' },
];

const mockEvents: Event[] = [
  { id: '1', title: 'Beginner Woodworking Workshop', description: 'Learn the basics of woodworking in this hands-on workshop.', date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), location: 'Our Workshop' },
  { id: '2', title: 'Annual Craft Fair', description: 'Visit our booth at the annual city craft fair to see our latest creations.', date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), location: 'City Center Plaza' },
  { id: '3', title: 'Advanced Joinery Class', description: 'Master complex joinery techniques with our expert craftsmen.', date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), location: 'Our Workshop' },
];


async function fetchData<T>(collectionName: string, mockData: T[], count?: number): Promise<T[]> {
  try {
    const q = count 
      ? query(collection(db, collectionName), limit(count))
      : query(collection(db, collectionName));
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No documents found in ${collectionName} collection. Returning mock data.`);
      return count ? mockData.slice(0, count) : mockData;
    }

    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error fetching from ${collectionName}:`, error);
    console.warn(`Returning mock data for ${collectionName} due to error.`);
    return count ? mockData.slice(0, count) : mockData;
  }
}

export async function getProducts(count?: number): Promise<Product[]> {
  return fetchData<Product>('products', mockProducts, count);
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    } else {
      console.warn(`Product with id ${id} not found. Returning mock data.`);
      return mockProducts.find(p => p.id === id) || null;
    }
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return mockProducts.find(p => p.id === id) || null;
  }
}

export async function getProjects(count?: number): Promise<Project[]> {
  return fetchData<Project>('projects', mockProjects, count);
}

export async function getEvents(count?: number): Promise<Event[]> {
    return fetchData<Event>('events', mockEvents, count);
}

export async function createUserProfile(user: FirebaseUser): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}
