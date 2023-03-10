import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { db, auth } from '../../firebase';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { AiOutlineShareAlt } from 'react-icons/ai';
import classes from './listing.module.css';
import Loader from '../../components/loader/Loader';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

const ListingItem = () => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [err, setError] = useState(null);
  const navigate = useNavigate();
  const params = useParams();
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      const docRef = doc(db, 'listings', params.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log('Document data:', docSnap.data());
        setListing(docSnap.data());
        setLoading(false);
      } else {
        setError('Wrong');
      }
    };
    fetchItem();
  }, [params.id]);

  if (loading) {
    return <Loader />;
  }
  return (
    <>
      {listing && (
        <main className='category'>
          <div>
            <Swiper
              modules={[Navigation, Pagination, Scrollbar, A11y]}
              slidesPerView={1}
              pagination={{ clickable: true }}
              style={{
                maxWidth: '500px',
                height: '500px',
              }}
            >
              {listing.imgUrls.map((url, index) => {
                return (
                  <SwiperSlide key={index}>
                    <div
                      className={classes.swiperSlideDiv}
                      style={{
                        position: 'relative',
                        background: `url(${listing.imgUrls[index]}) center no-repeat`,
                        height: '100%',
                        width: '100%',
                        backgroundSize: 'cover',
                      }}
                    ></div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

          <div className={classes.shareIconDiv}>
            <AiOutlineShareAlt
              fill='#013580'
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopiedLink(true);
                setTimeout(() => {
                  setCopiedLink(false);
                }, 2000);
              }}
            />
          </div>
          {copiedLink && <p className={classes.linkCopied}>Link copied</p>}

          <div>
            <p className={classes.categoryListingName}>
              {listing.name} - $
              {listing.offer
                ? listing.discountedPrice
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : listing.regularPrice
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </p>
            <p className={classes.categoryListingLocation}>
              Address: {listing.address}
            </p>
            <span className={classes.listingType}>
              For {listing.type === 'rent' ? 'Rent' : 'Sale'}
            </span>

            <p>{listing.bedrooms} bedrooms</p>
            <p>
              {listing.bathrooms}
              {listing.bathrooms > 1 ? ' bathrooms' : ' bathroom'}
            </p>
            <p>{listing.furnished ? 'Furnished' : 'Not furnished'}</p>
            <div>
              <MapContainer
                style={{
                  height: '300px',
                  width: '300px',
                }}
                center={[listing.geolocation.lat, listing.geolocation.long]}
                zoom={13}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url='https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png'
                />

                <Marker
                  position={[listing.geolocation.lat, listing.geolocation.long]}
                >
                  <Popup>{listing.address}</Popup>
                </Marker>
              </MapContainer>
            </div>

            {auth.currentUser?.uid !== listing.userRef && (
              <Link
                to={`/contact/${listing.userRef}?listingName=${listing.name}`}
                className={classes.primaryButton}
              >
                Contact
              </Link>
            )}
          </div>
        </main>
      )}
    </>
  );
};

export default ListingItem;
