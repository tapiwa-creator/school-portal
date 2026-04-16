import { 
  collection, 
  onSnapshot,
  query
} from "firebase/firestore";
import { db } from "../../Firebase/Firebase";

const EVENTS_COLLECTION = "events";

const StudentEventServices = {
  /**
   * Subscribes to real-time updates for events.
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
        console.error("Error subscribing to student events:", error);
        callback([]);
      });
    } catch (error) {
      console.error("Firebase Student Events Subscription failed:", error);
      callback([]);
      return () => {};
    }
  }
};

export default StudentEventServices;
