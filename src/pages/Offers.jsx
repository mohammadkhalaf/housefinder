import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import ListingItem from '../components/ListingItem';
import { db } from '../firebase';
import { toast } from 'react-toastify';

const Offers = () => {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'listings'),
          where('discount', '==', true),
          orderBy('timestamp', 'desc'),
          limit(10),
        );
        const querySnapshot = await getDocs(q);
        let listings = [];
        querySnapshot.forEach((doc) => {
          return listings.push({ id: doc.id, ...doc.data() });
        });
        setListings(listings);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchListings();
  }, []);

  // if (loading) {
  //   return <h5>...loading</h5>;
  // }
  return (
    <>
      <div>
        {listings && listings.length > 0 ? (
          <div>
            <ul>
              {listings.map((item) => {
                return <ListingItem key={item.id} {...item} />;
              })}
            </ul>
          </div>
        ) : (
          <div>No items</div>
        )}
      </div>
    </>
  );
};

export default Offers;
