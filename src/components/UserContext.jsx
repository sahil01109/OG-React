import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase/config";
import { 
  getDoc, arrayUnion, collection, getDocs, query, where, 
  doc, onSnapshot, setDoc, updateDoc, increment 
} from "firebase/firestore";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    // Fetch Telegram user data
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
      setUserId(telegramUser.id);
      setUsername(telegramUser.first_name);
    } else {
      console.warn("Telegram user data not available");
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
      try {
        const q = query(collection(db, "user"), where("id", "==", userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const userDocId = docSnap.id;
          const userDataFromDB = docSnap.data();
          
          const userRef = doc(db, "user", userDocId);
          
          // Set up real-time listener
          const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              setUserData({ id: userDocId, ...snapshot.data() });
            }
          });

          setUserData({ id: userDocId, ...userDataFromDB });

          return () => unsubscribe();
        } else {
          console.warn("User not found, creating new user...");
          await createUser(userId);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]); 

  // Function to create a new user
  const createUser = async (userId, referrerId = null) => {
    try {
      const userRef = doc(db, "user", String(userId));
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        console.log("User already exists in Firestore!");
        return;
      }

      const newUser = {
        id: userId,
        username: username || "Guest User",
        balance: 0,
        referred_by: referrerId || null,
        referrals: [],
        redeemedCodes: [] // Added for tracking redeemed codes
      };

      console.log("Writing new user to Firestore:", newUser);
      await setDoc(userRef, newUser);
      console.log("User successfully created!");

      if (referrerId) {
        const referrerRef = doc(db, "user", String(referrerId));
        console.log(`Updating referrer ${referrerId} with new referral ${userId}`);
        await updateDoc(referrerRef, {
          referrals: arrayUnion(String(userId)),
          balance: increment(100),
        });
        console.log(`Referrer ${referrerId} updated successfully!`);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // Function to update balance
  const updateBalance = async (amount) => {
    if (!userData) return;
    try {
      const userRef = doc(db, "user", String(userData.id));
      await updateDoc(userRef, { balance: increment(amount) });
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  // Get referral count
  const getReferralCount = async (userId) => {
    try {
      const userRef = doc(db, "user", String(userId));
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        return { 
          referralCount: userData.referrals?.length || 0, 
          claimedRewards: userData.claimedRewards || [] 
        };
      } else {
        console.warn("User not found");
        return { referralCount: 0, claimedRewards: [] };
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
      return { referralCount: 0, claimedRewards: [] };
    }
  };

  // Claim referral reward
  const claimReferralReward = async (userId, milestone, rewardAmount) => {
    if (!userId) return;

    try {
      const userRef = doc(db, "user", String(userId));
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.warn("User not found.");
        return;
      }

      const userData = userSnap.data();
      const claimedRewards = userData.claimedRewards || [];

      if (claimedRewards.includes(milestone)) {
        console.warn(`Reward for ${milestone} referrals already claimed.`);
        return;
      }

      await updateDoc(userRef, {
        claimedRewards: arrayUnion(milestone),
        balance: increment(rewardAmount),
      });

      console.log(`Reward for ${milestone} referrals claimed! Balance updated.`);
      return true;
    } catch (error) {
      console.error("Error claiming referral reward:", error);
      return false;
    }
  };

  return (
    <UserContext.Provider 
      value={{ userData, loading, updateBalance, createUser, getReferralCount, claimReferralReward }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to access user data
export const useUser = () => useContext(UserContext);
