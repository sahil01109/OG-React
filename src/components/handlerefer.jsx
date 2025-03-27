import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUser } from "../components/UserContext"; 

const ReferralHandler = () => {
  const [searchParams] = useSearchParams();
  const referrerId = searchParams.get("code"); // Get referral code from URL
  const { userData, createUser, isLoading } = useUser(); // Use user context
  const navigate = useNavigate();

  useEffect(() => {
    console.log("ReferralHandler Loaded");
    console.log("Referral Code from URL:", referrerId);

    // Wait until user data is fully loaded
    if (isLoading) return;

    if (!userData) {
      // If userData is null (new user), create one with the referral code
      if (referrerId) {
        const newUserId = Math.floor(Math.random() * 1000000); // Simulated new user ID
        console.log(`Creating user ${newUserId} referred by ${referrerId}`);

        createUser(newUserId, referrerId)
          .then(() => {
            console.log("User created successfully, redirecting...");
            navigate("/"); // Redirect to home
          })
          .catch((error) => {
            console.error("Error creating user:", error);
          });
      }
    } else {
      console.log("User already exists, skipping referral processing.");
      navigate("/"); // Redirect to home immediately if user exists
    }
  }, [userData, referrerId, createUser, navigate, isLoading]);

  return <h2>Processing Referral...</h2>; // Display loading message
};

export default ReferralHandler;
