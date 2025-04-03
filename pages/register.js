"use client"; // This is a client component 

import Image from "next/image";
import styles from "./register.css";
import Head from "next/head";
import 'bootstrap/dist/css/bootstrap.min.css';
import {db} from "../src/app/firebase";
import {collection, doc, setDoc, serverTimestamp} from 'firebase/firestore';
import { useState, useRef, useEffect, use } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight, faSleigh } from "@fortawesome/free-solid-svg-icons";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import emailjs from '@emailjs/browser'
import "../src/app/globals.css"
import FaqsComponent from "@/app/faqs_component"
import FaqsComponentMobile from "@/app/faqs_component-mobile";

export default function register() {

  const [CSAaboutIsExpanded, setCSAaboutIsExpanded] = useState(false);
  const [csaSelection, setCsaSelection] = useState("");
  const [csaShareSize, setCsaShareSize] = useState("full");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [secondEmail, setSecondEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [routeLengthDifference, setRouteLengthDifference] = useState(null);
  const [deliveryPrice, setDeliveryPrice] = useState(null);
  const [pickupPrice, setPickupPrice] = useState(500);
  const [formCompletion, setFormCompletion] = useState("please fill out all fields");
  const [amountDue, setAmountDue] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (firstName && lastName && email && phone && address && city && zipCode) {

      if (csaSelection === "homeDelivery") {
        if (deliveryPrice) {
          setFormCompletion("");
        } else {
          setFormCompletion("Sorry, we don't recognize this address. Try altering it. e.g. 'dr' to 'drive' ");
        }
    } else {
      if (csaSelection) {
        setFormCompletion("");
      } else {
        setFormCompletion("please select pickup or delivery");
      }
    }
  }
    else {
      setFormCompletion("please fill out all fields");
  }
  }, [firstName, lastName, email, phone, address, city, zipCode, csaSelection]);
  useEffect(() => {
    if (routeLengthDifference !== null) {
      setDeliveryPrice(Math.round((pickupPrice + ((routeLengthDifference / 1609) * 0.5 + 3) * ((csaShareSize === "full") ? 24 : 12)) / 5) * 5)
    }
  })
  useEffect(() => {
    if (csaSelection === "homeDelivery") {
      setAmountDue(deliveryPrice)
  } else {
      setAmountDue(pickupPrice)
  }
  }, [csaSelection, deliveryPrice, pickupPrice])
  const addMember = async (e) => {
    e.preventDefault();
    const docRef = doc(db, "2025 Members", `${firstName} ${lastName}`)
    await setDoc(docRef,{
      csaSelection: csaSelection,
      csaShareSize: csaShareSize,
      firstName: firstName,
      lastName: lastName,
      email: email,
      secondEmail: secondEmail,
      phone: phone,
      address: address,
      city: city,
      zipCode: zipCode,
      time: serverTimestamp(),
      amountDue: amountDue,
      paymentReceived: false
    });
    setFirstName("");
    setLastName("");
    setEmail("");
    setSecondEmail("");
    setPhone("");
    setAddress("");
    setCity("");
    setZipCode("");
    router.push(`/register/confirmation-page?amount=${amountDue}`);
  }
  const sendUserEmail = () => {
    emailjs
            .send('service_6fjtwym', 'template_jav91kj', {amount: `${amountDue}`, name: `${firstName}`, email: email}, {
              publicKey: 'YXPuuE9WWkJni1Uzb',
            })
            .then(
              (response) => {
                // console.log('SUCCESS!', response.status, response.text);
              },
              (err) => {
                // console.log('FAILED...', err);
              },
            );
  }
  const addedToNewsletterConfirmation = () => {
    emailjs
            .send('service_6fjtwym', 'template_oij7onh', {name: `${firstName} ${lastName}`, email: secondEmail}, {
              publicKey: 'YXPuuE9WWkJni1Uzb',
            })
            .then(
              (response) => {
                // console.log('SUCCESS!', response.status, response.text);
              },
              (err) => {
                // console.log('FAILED...', err);
              },
            );
  }
  function handleSubmit(e) {
    if (formCompletion === "") {
      addMember(e);
      sendUserEmail()
      addedToNewsletterConfirmation()
    }else {
      alert(formCompletion)
    }}
    const GetOptimizedRouteLength = async(waypoints) => {
      const response = await fetch(`/api/googleMaps?waypoints=${waypoints}`)
      const data = await response.json();
      var totalRouteMeters = 0
      data.routes[0].legs.forEach(leg => totalRouteMeters += leg.distance.value)
      return totalRouteMeters
      }
  const handleAddressBlur = async(event) => {
      // console.log("blur")
      if (address && city) {
        const waypoint = `${address}, ${city}`;
        try {
            var currentMemberAddresses = ["4100 sunset ct, ann arbor", "2109 arlene st, ann arbor", "4730 whitman circle, ann arbor", "2277 gray fox court, ann arbor", "2525 blueberry lane, ann arbor", "4598 east loch alpine, ann arbor", "3676 huron court, ann arbor"]
            var omittedAddresses = ["4100 sunset ct, ann arbor", "2109 arlene st, ann arbor", "4730 whitman circle, ann arbor", "2277 gray fox court, ann arbor", "2525 blueberry lane, ann arbor", "4598 east loch alpine, ann arbor", "3676 huron court, ann arbor"]
            var admittedAddresses = ["4100 sunset ct, ann arbor", "2109 arlene st, ann arbor", "4730 whitman circle, ann arbor", "2277 gray fox court, ann arbor", "2525 blueberry lane, ann arbor", "4598 east loch alpine, ann arbor", "3676 huron court, ann arbor"]
            if (currentMemberAddresses.includes(waypoint.toLowerCase())) {
              omittedAddresses.splice(currentMemberAddresses.indexOf(waypoint.toLowerCase()), 1)
              // console.log("removed")
            } else {
              admittedAddresses.push(waypoint)
              // console.log("added")
            }
            const omittedWaypoints = omittedAddresses.join('|')
            const admittedWaypoints = admittedAddresses.join('|')
            const omittedRouteLength = await GetOptimizedRouteLength(omittedWaypoints)
            const admittedRouteLength = await GetOptimizedRouteLength(admittedWaypoints)
            setRouteLengthDifference(admittedRouteLength - omittedRouteLength)
            } catch (error) {
                setRouteLengthDifference(null)
                setDeliveryPrice(null)
                // console.log(error)
            }
    }
    else {
      setRouteLengthDifference(null)
      setDeliveryPrice(null)
    }
  }
  const handleCsaSelectionChange = (event) => {
    setCsaSelection(event.target.value);
  }
  const handleCsaShareSizeChange = (event) => {
    setCsaShareSize(event.target.value)
    setPickupPrice(event.target.value === "half" ? 300 : 500)
  }
  return (
    <>
    <Head>
      <title>2025 CSA Registration</title>
      <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    />
    </Head>
    <div class="body">
    <div class="banner">
      <Image class="banner-img" src="/Hometown Harvest Logo (transparent background).png" width="2000" height="2000" alt="logo"/>
      <div class="banner-text">
        <div class="banner-titles">
          <h1 class="banner-title">2025 CSA Registration</h1>
          <h7 class="banner-subtitle">Form is to be completed and submitted online only</h7>
        </div>
        
      </div>
    </div>
    {/* <div class={(CSAaboutIsExpanded) ? "csa-about expand" : "csa-about"}>
      <h4 class="about-title">About</h4>
          <p>This is the first year of a CSA garden located on Zeeb Rd just North of Daly (5185 Zeeb). I do not own the land, although the owners have made me feel like I do. The produce will be grown on about an acre bordering a 10-acre leased section. Of course, the first year of anything is a challenge, but I’m confident that we’ll have an abundance of produce and satisfied members. Along with other experiences, I've completed a 9 month apprenticeship in Illinois on a labor intensive, Organic vegetable farm  (<a target="_blank" href="https://brockmanfamilyfarming.com/henrys-farm/">Henry’s Farm</a>).</p> 
          <p>The purpose is to grow as much of the highest quality produce possible and to give members the best deal available. High quality produce to me means it’s high in nutrients, free of toxins, and great in taste. Visual appeal is also important to me. Factors like uniformity, transportability, and shelf life which take priority in wholesale markets do not apply so much here. To accomplish this, I’m using compost (from <a target="_blank" href="https://www.wecarecompost.com/wecare-products/locations/ann-arbor-mi/">Ann Arbor Compost Center</a>) instead of chemical fertilizer, alternative pest solutions like native plants instead of pesticides, and mechanical methods of weed removal.</p>
          <p>If all goes to plan, this will be a 25-week CSA beginning the last week of May and running until early November. You’ll get to see a total of 45 different crops throughout the year. Shares will consist of 8-10 items (about $2 per item).  An item being… a bunch of Kale, two heads of lettuce, 2lb bag of spinach (wet), a pint of cherry tomatoes, 3 eggplants, etc. Share sizes will fluctuate depending on productivity. You can see an optimistic, week by week outline of the plan <a target="_blank" href="/CSA-Week-by-Week.pdf">here</a>. There will be choices between certain items (e.g. choose kale or kohlrabi, pick two of three: Bok choi, tatsoi or komatsuna). You may select either Wednesday delivery or Saturday pick-up when you sign up. For the delivery members, there will be a form to complete each week to handle the choice items.</p>
      <span class={(CSAaboutIsExpanded) ? "readmore-link expand" : "readmore-link"} onClick={() => {setCSAaboutIsExpanded(!CSAaboutIsExpanded)}}></span>
    </div> */}
    <form class="form" onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(e);
    }}>
        <h4>Contact Info</h4>
      <div class="row">
        <div class="col-sm-6 col-12">
          <input
            type="text"
            class="form-control"
            name="firstName"
            placeholder="First name"
            value={firstName}
            aria-label="First name"
            onChange={e => setFirstName(e.target.value)}
          />
        </div>
        <div class="col-sm-6 col-12">
          <input
            type="text"
            class="form-control"
            name="lastName"
            placeholder="Last name"
            value={lastName}
            aria-label="Last name"
            onChange={e => setLastName(e.target.value)}
          />
        </div>
      </div>
      <div class="row">
        <div class="col-md-8 col-12">
          <input 
            type="email"
            class="form-control"
            name="email"
            placeholder="Email (will receive a weekly newsletter)"
            value={email}
            aria-label="email"
            onChange={e => setEmail(e.target.value)}
          />
        </div>
      </div>
      <div class="row">
        <div class="col-md-8 col-12">
          <input 
            type="secondEmail"
            class="form-control"
            name="secondEmail"
            placeholder="Second email for newsletter (optional)"
            value={secondEmail}
            aria-label="extra-email"
            onChange={e => setSecondEmail(e.target.value)}
          />
        </div>
        <div class="col-md-4 col-sm-6 col-xs-10">
            <input 
              type="text"
              class="form-control"
              name="phone"
              placeholder="Phone"
              value = {phone}
              aria-label="phone"
              onChange={e => setPhone(e.target.value)}
            />
          </div>
      </div>
      <h4>Address</h4>
      <div class="row">
        <div class="col-12 col-md-6">
          <input
            type="text"
            class="form-control"
            name="streetAddress"
            id="streetAddress"
            placeholder="Street address"
            value={address}
            aria-label="Street Address"
            onChange={e => setAddress(e.target.value)}
            onBlur={e => handleAddressBlur(e.target.value)}
          />
        </div>
        <div class="col-6 col-md-4">
          <input
            type="text"
            class="form-control"
            name="city"
            id="city"
            placeholder="City"
            value={city}
            aria-label="City"
            onChange={e => setCity(e.target.value)}
            onBlur={e => handleAddressBlur(e.target.value)}
          />
        </div>
          <div class="col-6 col-md-2">
            <input
              type="text"
              class="form-control"
              name="zipCode"
              placeholder="Zip code"
              value={zipCode}
              aria-label="Zip code"
              onChange={e => setZipCode(e.target.value)}
              />
          </div>
        </div>
        <div className="share-size">
          <h4>Share Configuration</h4>
          <label for="full">
          <input
              type="radio"
              name="shareSize"
              value="full"
              onChange={handleCsaShareSizeChange}
              id="full"
              checked={csaShareSize === "full"}
            />
            Full Share <i>-24 weeks</i>
            </label>
          <label>
            <input
              type="radio"
              name="shareSize"
              value="half"
              onChange={handleCsaShareSizeChange}
              id="full"
            />
            Half Share <i style={{color: "#434343"}}>-every other week for 24 weeks ($300)</i>
          </label>
        </div>
          <p>You may either pick up your weekly share at the garden (5185 Zeeb Rd) from 12 to 6PM on Saturdays or choose to have it delivered on Tuesdays around 4PM. Delivery rates vary based on your location.</p>    
      <div class="row csa-options">
          <div class="col option" style={csaSelection == "gardenPickup" ? {color: 'black', border: "2px solid black", backgroundColor: '#d0d0d0'} : {color: 'gray', border: "2px solid gray"}}>
            <input type="radio" id="gardenPickup" name="csaOption" value="gardenPickup" onChange={handleCsaSelectionChange}/>
            <label for="gardenPickup">
                <h3 className="option-title">Garden Pickup</h3>
                <Image class="image" src={csaSelection == "gardenPickup" ? "/man-carrying-package.png" : "/man-carrying-package-gray.png"} width="100" height="100"/>
                <h6>About ${Math.round(pickupPrice / (csaShareSize == "half" ? 12:24))} Per Week</h6>
                <h4>${csaShareSize == "half" ? 300:500}</h4>
            </label>
          </div>
          
          <div class="col option" style={csaSelection == "homeDelivery" ? {color: 'black', border: "2px solid black", backgroundColor: '#d0d0d0'} : {color: 'gray', border: "2px solid gray"}}>
            <input type="radio" id="homeDelivery" name="csaOption" value="homeDelivery" onChange={handleCsaSelectionChange}/>
            <label for="homeDelivery">
                <h3 className="option-title">Home Delivery</h3>
                <Image class="image" src={csaSelection == "homeDelivery" ? "/express-delivery.png" : "/express-delivery-gray.png"} width="100" height="100"/>
                <h6>{deliveryPrice ? `About $${Math.round((deliveryPrice-pickupPrice) / ((csaShareSize === "full" ? 24 : 12)))} per week more` : "Enter Address to calculate price"}</h6>
                <h4>{deliveryPrice ? `$${deliveryPrice}`: '$ ???'}</h4>
            </label>
          </div>
          
          
            {/* <div class="form-check">

                <input class="form-check-input" type="radio" name="flexRadioDefault" value="saturday pick up" id="flexRadioDefault1" onChange={handleCsaSelectionChange} />
                <label class="form-check-label" for="flexRadioDefault1">
                  Saturday pick up at garden (5185 Zeeb Rd) <b>-$500</b>
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" value="homeDelivery" id="flexRadioDefault2" onChange={handleCsaSelectionChange}/>
                <label class="form-check-label" for="flexRadioDefault2">
                  homeDelivery {deliveryPrice ? <b>{500+deliveryPrice}</b> : <><b>-???</b> enter address to view your price</>}
                </label>
              </div> */}
      </div>
          <button class="submit-btn btn btn-dark" disabled={formCompletion !== ""} type="submit">Submit</button>
        </form>
      <h4>Payment</h4>
      <div class="container">
        <div class="row">
          <div class="col-sm-6 payment-option">
            <h6>Write a check</h6>
            <ul>
              <li>Make checks payable to "Hometown Harvest LLC"</li>
              <li>Mail to the following address or hand deliver to Paul:<br/>
                4161 Sunset Ct, Ann Arbor, MI 48103 </li>
              <li>Ensure you have sufficient account funds as checks will be cashed upon arrival</li>
            </ul>
          </div>
          <div class="col-sm-6 payment-option">
            <h6>Pay with Venmo</h6>
            <Image src="/MyVenmoQRCode.png" width="150" height="204" alt="venmo QR Code" />
            <p>Venmo Email: paul.r.schaefer11@gmail.com</p>
          </div>
        </div>
        <div class="payment-info">
        Signing up alone does not confirm your membership. Only once your payment has been received is your status as a member confirmed. Spots are limited so be sure to pay as soon as you can to secure your membership!
        </div>
      </div>
      <h4 class="faq-title desktop">Frequently Asked Questions</h4>
      <div class="faqsOnRegisterPage">
        <div class="desktop">
            <FaqsComponent/>
          </div>
          <div class="mobile">
            <FaqsComponentMobile/>
          </div>
        </div>
      <div class="contact-info">
        <h4>Contact Information</h4>
        <div class="row">
          <div class="col">
            Email:
          </div>
          <div class="value col">
            <a href="mailto:hometownharvestllc@gmail.com">hometownharvestllc@gmail.com</a>
          </div>
        </div>
        <div class="row">
          <div class="col">
            Phone:
          </div>
          <div class="value col">
            (734) 417-9715
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
