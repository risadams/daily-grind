// Database service for handling Firebase Firestore operations
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase/config.js';

// Tickets collection operations
export const getTicketById = async (ticketId) => {
  try {
    const docRef = doc(db, 'tickets', ticketId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Ticket not found' };
    }
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return { success: false, error: error.message };
  }
};

export const getAllTickets = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'tickets'));
    const tickets = [];
    
    querySnapshot.forEach((doc) => {
      tickets.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: tickets };
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return { success: false, error: error.message };
  }
};

export const getTicketsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, 'tickets'), 
      where('assignedToUserId', '==', userId),
      orderBy('creationDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const tickets = [];
    
    querySnapshot.forEach((doc) => {
      tickets.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: tickets };
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    return { success: false, error: error.message };
  }
};

export const createTicket = async (ticketData) => {
  try {
    // Convert creationDate to a proper Firestore timestamp if it's a string
    const processedData = {
      ...ticketData,
      creationDate: new Date(ticketData.creationDate || Date.now())
    };
    
    // If we have a specific ID to use
    if (processedData.id) {
      const idStr = String(processedData.id); // Ensure ID is a string
      await setDoc(doc(db, 'tickets', idStr), processedData);
      return { success: true, data: { ...processedData, id: idStr } };
    } else {
      // Let Firebase generate ID
      const docRef = await addDoc(collection(db, 'tickets'), processedData);
      return { success: true, data: { id: docRef.id, ...processedData } };
    }
  } catch (error) {
    console.error('Error creating ticket:', error);
    return { success: false, error: error.message };
  }
};

export const updateTicket = async (ticketId, ticketData) => {
  try {
    // Ensure ticketId is a string
    const stringTicketId = String(ticketId);
    
    // Remove creationDate from update data to preserve original
    const { creationDate, ...updateData } = ticketData;
    
    // Add last modified date if not provided
    if (!updateData.lastModifiedDate) {
      updateData.lastModifiedDate = new Date().toISOString();
    }
    
    console.log(`Database service updating ticket ${stringTicketId} with:`, updateData);
    
    // Ensure the document reference is created with a string ID
    await updateDoc(doc(db, 'tickets', stringTicketId), updateData);
    return { success: true, data: { id: stringTicketId, ...updateData } };
  } catch (error) {
    console.error('Error updating ticket:', error);
    return { success: false, error: error.message };
  }
};

export const deleteTicket = async (ticketId) => {
  try {
    await deleteDoc(doc(db, 'tickets', String(ticketId)));
    return { success: true };
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return { success: false, error: error.message };
  }
};

// Types collection operations
export const getAllTypes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'types'));
    const types = [];
    
    querySnapshot.forEach((doc) => {
      types.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: types };
  } catch (error) {
    console.error('Error fetching types:', error);
    return { success: false, error: error.message };
  }
};

// States collection operations
export const getAllStates = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'states'));
    const states = [];
    
    querySnapshot.forEach((doc) => {
      states.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: states };
  } catch (error) {
    console.error('Error fetching states:', error);
    return { success: false, error: error.message };
  }
};

// Ticket links collection operations
export const getTicketLinksByTicketId = async (ticketId) => {
  try {
    const q = query(
      collection(db, 'ticketLinks'), 
      where('sourceTicketId', '==', ticketId)
    );
    
    const querySnapshot = await getDocs(q);
    const links = [];
    
    querySnapshot.forEach((doc) => {
      links.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: links };
  } catch (error) {
    console.error('Error fetching ticket links:', error);
    return { success: false, error: error.message };
  }
};

export const createTicketLink = async (linkData) => {
  try {
    // If we have a specific ID to use
    if (linkData.id) {
      await setDoc(doc(db, 'ticketLinks', String(linkData.id)), linkData);
      return { success: true, data: linkData };
    } else {
      // Let Firebase generate ID
      const docRef = await addDoc(collection(db, 'ticketLinks'), linkData);
      return { success: true, data: { id: docRef.id, ...linkData } };
    }
  } catch (error) {
    console.error('Error creating ticket link:', error);
    return { success: false, error: error.message };
  }
};

export const deleteTicketLink = async (linkId) => {
  try {
    await deleteDoc(doc(db, 'ticketLinks', String(linkId)));
    return { success: true };
  } catch (error) {
    console.error('Error deleting ticket link:', error);
    return { success: false, error: error.message };
  }
};

// Get all priority levels
export const getAllPriorities = async () => {
  try {
    const q = query(collection(db, 'priorities'), orderBy('order'));
    const querySnapshot = await getDocs(q);
    const priorities = [];
    
    querySnapshot.forEach((doc) => {
      priorities.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: priorities };
  } catch (error) {
    console.error('Error fetching priorities:', error);
    return { success: false, error: error.message };
  }
};

// Create a new priority level
export const createPriority = async (priorityData) => {
  try {
    // If we have a specific ID to use
    if (priorityData.id) {
      await setDoc(doc(db, 'priorities', String(priorityData.id)), priorityData);
      return { success: true, data: priorityData };
    } else {
      // Let Firebase generate ID
      const docRef = await addDoc(collection(db, 'priorities'), priorityData);
      return { success: true, data: { id: docRef.id, ...priorityData } };
    }
  } catch (error) {
    console.error('Error creating priority:', error);
    return { success: false, error: error.message };
  }
};

// Get a priority by ID
export const getPriorityById = async (priorityId) => {
  try {
    const docRef = doc(db, 'priorities', String(priorityId));
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Priority not found' };
    }
  } catch (error) {
    console.error('Error fetching priority:', error);
    return { success: false, error: error.message };
  }
};

// Users collection operations
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: error.message };
  }
};

export const getUserById = async (userId) => {
  try {
    const docRef = doc(db, 'users', String(userId));
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: error.message };
  }
};

export const createOrUpdateUser = async (userData) => {
  try {
    const { uid, displayName, email } = userData;
    await setDoc(doc(db, 'users', uid), {
      displayName,
      email,
      lastUpdated: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
};