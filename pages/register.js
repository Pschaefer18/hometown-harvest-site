"use client"; // This is a client component 

import Image from "next/image";
import styles from "./register.css";
import Head from "next/head";
import 'bootstrap/dist/css/bootstrap.min.css';
import {db} from "../src/app/firebase";
import {collection, addDoc} from 'firebase/firestore';
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

export default function register() {

  const [isExpanded, setIsExpanded] = useState(false);
  const [csaSelection, setCsaSelection] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [secondEmail, setSecondEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [withinDeliveryRange, setWithinDeliveryRange] = useState(null);
  const [formCompletion, setFormCompletion] = useState("please fill out all fields");
  const router = useRouter();

  useEffect(() => {
    if (firstName && lastName && email && phone && address && city && zipCode) {

      if (csaSelection === "wednesday home delivery") {
        if (withinDeliveryRange) {
          setFormCompletion("");
        } else {
          setFormCompletion("Your address is outside of the delivery range, either move somewhere closer or pickup at the garden :)");
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
  }, [firstName, lastName, email, phone, address, city, zipCode, csaSelection, withinDeliveryRange]);
  const addMember = async (e) => {
    e.preventDefault();
    const docRef = await addDoc(collection(db, "Members"),{
      csaSelection: csaSelection,
      firstName: firstName,
      lastName: lastName,
      email: email,
      secondEmail: secondEmail,
      phone: phone,
      address: address,
      city: city,
      zipCode: zipCode
    });
    setFirstName("");
    setLastName("");
    setEmail("");
    setSecondEmail("");
    setPhone("");
    setAddress("");
    setCity("");
    setZipCode("");
    var amount = 0;
    if (csaSelection === "wednesday home delivery") {
        amount = 625
    } else {
        amount = 500
    }
    router.push(`/register/confirmation-page?amount=${amount}`);
  }
  function handleSubmit(e) {
    if (formCompletion === "") {
      addMember(e);
    }else {
      alert(formCompletion)
    }}
  const handleAddressBlur = async(event) => {
      console.log("blur")
      if (address && city) {
        const destination = `${address}, ${city}`;
        try {
            const response = await fetch(`/api/googleMaps?destination=${destination}`)
            const data = await response.json();
        // compare response value in meters (13250 =~8.25 mi)
            if (data.routes[0].legs[0].distance.value < 13250) {
              setWithinDeliveryRange(true);
            } else {
              setWithinDeliveryRange(false);
            }} catch (error) {
                setWithinDeliveryRange(false);
            }

    }
  }
  const handleCsaSelectionChange = (event) => {
    setCsaSelection(event.target.value);
  }
  return (
    <>
    <Head>
      <title>Signup</title>
      <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
    />
    </Head>
    <div class="body">
    <div class="banner">
      <Image class="banner-img" src="/Web-logo-long.jpg" width="2000" height="175" alt="logo"/>
      <h1>2024 CSA Registration</h1>
      <h6 class="h6">25 week CSA providing 8-10 items weekly</h6>
    </div>
    <div class={(isExpanded) ? "csa-about expand" : "csa-about"}>
      <h4 class="about-title">Frequently Asked Questions</h4>
      <h5>What is a CSA?</h5>
      <p>
        "CSA" stands for "Community Supported Agriculture". Today’s CSAs tend to be a subscription where the customer makes an up-front payment and receives a box of produce each week throughout the growing season (this one is no different).  The first CSAs took place in Japan in response to concern around chemicals used in farming. The new iteration we know today in North America took off in the 80s and, although similar, formed independently of the Japanese and is based on Rudolph Steiner's ideas from the 1920s.
      </p>
      <h5>What will this CSA look like?</h5>
      <p>If all goes to plan, this will be a 25-week CSA beginning late May and running until the first week in November. You’ll get to see a total of 45 different crops throughout the year. Shares will consist of 8-10 items (about $2 per item).  An item being… a bunch of Kale, two heads of lettuce, 2lb bag of spinach (wet), a pint of cherry tomatoes, 3 eggplants, etc. Share sizes will fluctuate depending on productivity. You can see an optimistic, week by week outline of the plan <a target="_blank" href="/CSA-Week-by-Week.pdf">here</a>. There will be choices between certain items (e.g. choose kale or kohlrabi, pick two of three: Bok choi, tatsoi or komatsuna). You may select either Wednesday delivery or Saturday pick-up when you sign up. For the delivery members, there will be a form to complete each week to handle the choice items.</p>
      <h5>What risk am I taking?</h5>
      <p>As a CSA member, you are sharing risk, not unlike an investor. You should be aware of what those risks are and how they apply in our case. I’ve done my best to provide an overview of <a target="_blank" href="/Threats.pdf">common threats to small growers</a> and which ones I am concerned about.</p>
      <h5>What are your growing practices?</h5>
      <p>Although this is not a certified organic operation, all practices will follow organic standards. In lieu of pesticides, beds of native plants will be placed periodically throughout the garden beds. In place of chemical fertilizer, heavy amounts of compost will be used. The only pesticide that will be sprayed is BT (<a target="_blank" href="https://en.wikipedia.org/wiki/Bacillus_thuringiensis">bacillus thuringiensis</a>). It's a bacterium that targets caterpillars (cabbage and tomato worms) and is allowed under Organic regulations. </p>
      <span class={(isExpanded) ? "readmore-link expand" : "readmore-link"} onClick={() => {setIsExpanded(!isExpanded)}}></span>
    </div>
    <form class="form" onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(e);
    }}>
        <h4>Pick up/Delivery </h4>
      <div class="row">
        <div class="col csa-selection">
            <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" value="saturday pick up" id="flexRadioDefault1" onChange={handleCsaSelectionChange} />
                <label class="form-check-label" for="flexRadioDefault1">
                  Saturday pick up at garden (5185 Zeeb Rd) <b>-$500</b>
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" value="wednesday home delivery" id="flexRadioDefault2" onChange={handleCsaSelectionChange}/>
                <label class="form-check-label" for="flexRadioDefault2">
                  Wednesday home delivery ($5 per week more) *must qualify* <b>-$625</b>
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="flexRadioDefault" value="Sunset Ct" id="flexRadioDefault3" onChange={handleCsaSelectionChange}/>
                <label class="form-check-label" for="flexRadioDefault3">
                  I live on Sunset ct and will receive free delivery <b>-$500</b>
                </label>
              </div>
        </div>
      </div>
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
            placeholder="Email (will recieve a weekly newsletter)"
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
          {withinDeliveryRange != null && csaSelection == "wednesday home delivery" ? (<span class={`delivery-status ${withinDeliveryRange ? 'text-success' : 'text-danger'}`}>{withinDeliveryRange ? ('Hurray! your address qualifies for Wednesday Delivery.') : 'Sorry, this address does not qualify for wednesday delivery.'}</span>) : (null)}
          <button class="submit-btn" type="submit">Submit</button>
        </form>
      <h2>Payment</h2>
      <ul>
        <li>Make checks payable to "Paul Schaefer"</li>
        <li>Mail to the following address or hand deliver to me:<br/>
            4161 Sunset Ct, Ann Arbor, MI 48103 </li>
        <li>Payments must be made before May 1st to confirm your membership</li>
        <li>Ensure you have sufficient account funds as checks will be cashed upon arrival</li>
        <li>Once your check has been received, you'll be notified and your status as a member will be confirmed</li>
      </ul>
  </div>
    </>
  );
}
