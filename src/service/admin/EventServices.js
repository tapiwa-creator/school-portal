import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  serverTimestamp,
  query
} from "firebase/firestore";
import { db } from "../../Firebase/Firebase";

const EVENTS_COLLECTION = "events";

const AdminEventServices = {
  /**
   * Subscribes to real-time updates for all events.
   * @param {function} callback - Receives an array of events
   * @returns {function} Unsubscribe function
   */
  subscribeToEvents: (callback) => {
    try {
      const eventsQuery = query(collection(db, EVENTS_COLLECTION));
      
      return onSnapshot(eventsQuery, (snapshot) => {
        const events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Manual sorting to avoid Firestore 400 'requires index' errors
        events.sort((a, b) => {
          if (!a.eventDate) return 1;
          if (!b.eventDate) return -1;
          return new Date(a.eventDate) - new Date(b.eventDate);
        });
        callback(events);
      }, (error) => {
        console.error("Error subscribing to admin events:", error);
        callback([]);
      });
    } catch (error) {
      console.error("Firebase Admin Events Subscription failed:", error);
      callback([]);
      return () => {};
    }
  },

  /**
   * Add a new event to Firestore
   */
  addEvent: async (eventData) => {
    try {
      const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
        ...eventData,
        createdAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error("Error adding event:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update an existing event in Firestore
   */
  updateEvent: async (id, eventData) => {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...eventData,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error("Error updating event:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete an event from Firestore
   */
  deleteEvent: async (id) => {
    try {
      const docRef = doc(db, EVENTS_COLLECTION, id);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error("Error deleting event:", error);
      return { success: false, error: error.message };
    }
  }
};

export default AdminEventServices;
