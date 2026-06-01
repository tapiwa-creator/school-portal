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
   * @param {string} studentGrade - The grade of the student to filter valid events
   * @returns {function} Unsubscribe function
   */
  subscribeToEvents: (callback, studentGrade) => {
    try {
      const eventsQuery = query(collection(db, EVENTS_COLLECTION));
      
      return onSnapshot(eventsQuery, (snapshot) => {
        let events = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter by audience (role/grade)
        if (studentGrade) {
          events = events.filter(e => {
            const audience = e.audience || [];
            if (audience.length === 0) return true; // Assume visible to all if no audience set
            return audience.includes("All") || audience.includes(studentGrade);
          });
        }
        
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
