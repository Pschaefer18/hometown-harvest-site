"use client"; // This is a client component 

import Image from "next/image";
import styles from "./register.css";
import Head from "next/head";
import 'bootstrap/dist/css/bootstrap.min.css';
import {db} from "../src/app/firebase";
import {collection, doc, setDoc, serverTimestamp} from 'firebase/firestore';
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight, faSleigh } from "@fortawesome/free-solid-svg-icons";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import emailjs from '@emailjs/browser'

export default function register() {

  const FAQs = [
    {
      question: "What is a CSA?",
      answer: `"CSA" stands for "Community Supported Agriculture". Today’s CSAs tend to be a subscription where the customer makes an up-front payment and receives a box of produce each week throughout the growing season (this one is no different).  The first CSAs took place in Japan in response to concern around chemicals used in farming. The new iteration we know today in North America took off in the 80s and, although similar, formed independently of the Japanese and is based on Rudolph Steiner's ideas from the 1920s.`
    },
    {
      question: "What risk am I taking?",
      answer: `As a CSA member, you are sharing risk, not unlike an investor. You should be aware of what those risks are and how they apply in our case. I’ve done my best to provide an overview of **link** and which ones I am concerned about.`,
      link: {
              href: "/Threats.pdf",
              placeholder: "common threats to small growers"
            }
    },
    {
      question: "What is the history of the land?",
      answer: "The land was conventionally farmed corn and soy until 2023 when it was planted in perennial hay. The clay loam is now compacted and low in organic matter. Because of this, I’ve decided to go HEAVY on compost to add nutrients, improve structure, and bring back the biology required for small scale vegetable production."
    },
    {
      question: "Is it Organic?",
      answer: "Obtaining Organic certification is a lengthy process and something for a later year. However, I won't be using any products or practices that are prohibited under Organic standards."
    },
    {
      question: "How will communication work?",
      answer: "Beginning in May, I’ll start sending out some email updates. Once the program kicks off around the last week of May, you’ll receive a weekly newsletter with any important information, an update of how things are going, and what will be in your share for the week. Contact me if you have any questions or concerns. Email: hometownharvestllc@gmail.com, phone: (734) 417-9715"
    },
    {
      question: "What if I’m gone for a week and can’t pick up my share?",
      answer: "If you know ahead of time that you'll be absent for a CSA pickup/delivery, please contact me by text or email at least one week before (see contact info at bottom of page). As long as I'm aware before harvesting time, you'll be able to receive a double share the following week. This does not, however, carry over for a third week. If you fail to notify me, someone will eat your share and you won't be getting a double share."
    },
    {
      question: "What if I forget to pick up my share?",
      answer: "I understand that many of my members have chaotic lives and picking up a box of produce might not be of top priority. If you realize you forgot to pick up your share, it will be held for 24 hours, and you can pick it up the next morning. After that, someone will eat it. I don’t plan to keep track of who’s picked up and who hasn’t, so I won’t be able to notify you if you forget."
    },
    {
      question: "Can I come visit?",
      answer: "Yes, whether you’ve already signed up or are considering signing up, you are always welcome to come visit. Just be sure to message me (734-417-9715) in advance to set up a time. If you’re trying to decide if you want to join the program, I can talk and show you around. Otherwise, you’ll be on your own to explore."
    }
  ]
  const [CSAaboutIsExpanded, setCSAaboutIsExpanded] = useState(false);
  const [CSAfaqIsExpanded, setCSAfaqIsExpanded] = useState(false);
  const [csaSelection, setCsaSelection] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [secondEmail, setSecondEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [recognizedAddress, setRecognizedAddress] = useState(null);
  const [deliveryPrice, setDeliveryPrice] = useState(null);
  const [formCompletion, setFormCompletion] = useState("please fill out all fields");
  const [isOpen, setIsOpen] = useState(Array(FAQs.length).fill(false));
  const router = useRouter();

  useEffect(() => {
    if (firstName && lastName && email && phone && address && city && zipCode) {

      if (csaSelection === "homeDelivery") {
        if (recognizedAddress) {
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
  }, [firstName, lastName, email, phone, address, city, zipCode, csaSelection, recognizedAddress]);
  const addMember = async (e) => {
    e.preventDefault();
    const docRef = doc(db, "2025 Members", `${firstName} ${lastName}`)
    await setDoc(docRef,{
      csaSelection: csaSelection,
      firstName: firstName,
      lastName: lastName,
      email: email,
      secondEmail: secondEmail,
      phone: phone,
      address: address,
      city: city,
      zipCode: zipCode,
      time: serverTimestamp(),
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
    var amount = 0;
    if (csaSelection === "homeDelivery") {
        amount = 625
    } else {
        amount = 500
    }
    router.push(`/register/confirmation-page?amount=${amount}`);
  }
  const sendUserEmail = () => {
    emailjs
            .send('service_6fjtwym', 'template_jav91kj', {name: `${firstName}`, email: email}, {
              publicKey: 'YXPuuE9WWkJni1Uzb',
            })
            .then(
              (response) => {
                console.log('SUCCESS!', response.status, response.text);
              },
              (err) => {
                console.log('FAILED...', err);
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
                console.log('SUCCESS!', response.status, response.text);
              },
              (err) => {
                console.log('FAILED...', err);
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
      console.log("blur")
      if (address && city) {
        const waypoint = `${address}, ${city}`;
        try {
            var currentMemberAddresses = ["4100 sunset ct, ann arbor", "2109 arlene st, ann arbor", "4730 whitman circle, ann arbor", "2277 gray fox court, ann arbor", "2525 blueberry lane, ann arbor", "4598 east loch alpine, ann arbor", "3676 huron court, ann arbor"]
            var omittedAddresses = ["4100 sunset ct, ann arbor", "2109 arlene st, ann arbor", "4730 whitman circle, ann arbor", "2277 gray fox court, ann arbor", "2525 blueberry lane, ann arbor", "4598 east loch alpine, ann arbor", "3676 huron court, ann arbor"]
            var admittedAddresses = ["4100 sunset ct, ann arbor", "2109 arlene st, ann arbor", "4730 whitman circle, ann arbor", "2277 gray fox court, ann arbor", "2525 blueberry lane, ann arbor", "4598 east loch alpine, ann arbor", "3676 huron court, ann arbor"]
            var omittedCalc = 0
            var admittedCalc = 0
            if (currentMemberAddresses.includes(waypoint.toLowerCase())) {
              omittedAddresses.splice(currentMemberAddresses.indexOf(waypoint.toLowerCase()), 1)
              console.log("removed")
            } else {
              admittedAddresses.push(waypoint)
              console.log("added")
            }
            const omittedWaypoints = omittedAddresses.join('|')
            const admittedWaypoints = admittedAddresses.join('|')
            console.log(omittedAddresses)
            console.log(admittedAddresses)
            const omittedRouteLength = await GetOptimizedRouteLength(omittedWaypoints)
            const admittedRouteLength = await GetOptimizedRouteLength(admittedWaypoints)
            const routeLengthDifference = admittedRouteLength - omittedRouteLength
            const homeDeliveryPrice = Math.round((500 + ((routeLengthDifference / 1609) * 0.5 + 3) * 24) / 5) * 5
            setDeliveryPrice(homeDeliveryPrice)
            } catch (error) {
                setRecognizedAddress(false);
                console.log(error)
            }

    }
  }
  const handleCsaSelectionChange = (event) => {
    setCsaSelection(event.target.value);
  }
  const toggleFaq = (key) => {
    var newArray = [...isOpen];
    newArray[key] =!isOpen[key];
    setIsOpen(newArray);
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
          <h1>2025 CSA Registration</h1>
          <h7>Form is to be completed and submitted online only</h7>
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
          <h4>Select An Option </h4>
          <p>You may either pick up your weekly share at the garden (5185 Zeeb Rd) from 12 to 6PM on Saturdays or choose to have it delivered on Wednesdays around 4PM. Delivery rates vary based on your location.</p>
      <div class="row csa-options">
          <div class="col option" style={csaSelection == "gardenPickup" ? {color: '#f1f1f1', backgroundColor: 'black'} : {color: 'black', backgroundColor: '#f1f1f1'}}>
            <input type="radio" id="gardenPickup" name="csaOption" value="gardenPickup" onChange={handleCsaSelectionChange}/>
            <label for="gardenPickup">
                <h3>Garden Pickup</h3>
                <Image class="image" src={csaSelection == "gardenPickup" ? "/man-carrying-package-gray.png" : "/man-carrying-package.png"} width="100" height="100"/>
                <h6>About $21 Per Week</h6>
                <h4>$500</h4>
            </label>
          </div>
          
          <div class="col option" style={csaSelection == "homeDelivery" ? {color: '#f1f1f1', backgroundColor: 'black'} : {color: 'black', backgroundColor: '#f1f1f1'}}>
            <input type="radio" id="homeDelivery" name="csaOption" value="homeDelivery" onChange={handleCsaSelectionChange}/>
            <label for="homeDelivery">
                <h3>Home Delivery</h3>
                <Image class="image" src={csaSelection == "homeDelivery" ? "/express-delivery-gray.png" : "/express-delivery.png"} width="100" height="100"/>
                <h6>{deliveryPrice ? `About $${Math.round((deliveryPrice-500) / 24)} per week more` : "Enter Address to calculate price"}</h6>
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
          <button class="submit-btn" type="submit">Submit</button>
        </form>
      <h4>Payment</h4>
      <div class="container">
        <div class="row">
          <div class="col-sm-6 payment-option">
            <h5>Write a check</h5>
            <ul>
              <li>Make checks payable to "Paul Schaefer"</li>
              <li>Mail to the following address or hand deliver to me:<br/>
                4161 Sunset Ct, Ann Arbor, MI 48103 </li>
              <li>Ensure you have sufficient account funds as checks will be cashed upon arrival</li>
            </ul>
          </div>
          <div class="col-sm-6 payment-option">
            <h5>Pay with Venmo</h5>
            <Image src="/MyVenmoQRCode.png" width="150" height="204" alt="venmo QR Code" />
            <p>Venmo Email: paul.r.schaefer11@gmail.com</p>
          </div>
        </div>
        <div class="payment-info">
        Payments must be made before May 18th to secure your membership <br/>
        Once your payment has been received, you'll be notified and your status as a member will be confirmed
        </div>
      </div>
      <h4 class="faq-title">Frequently Asked Questions</h4>
      <div class="csa-faq">
        <ul>
          {FAQs.map((faq, key) => (
            <li key={key}>
              <div class="faq" onClick={() => toggleFaq(key)}><FontAwesomeIcon icon={isOpen[key] ? (faCaretDown):(faCaretRight)} width="20px" height="20px" class="icon"/><h5>{faq.question}</h5></div>
              <p class={`faq-answer ${isOpen[key] ? "open" : ""}`}>
                {faq.answer.split(' ').map((word, index) => (
                  <span key={index}>
                    {word ===  "**link**"? ( // Replace '**link**' with actual link
                      <a href={faq.link.href}>
                        {faq.link.placeholder}
                      </a>
                    ) : ( word )}
                {' '} {/* Add a space after each word */}
                  </span>
    ))}
  </p>
            </li>
          ))}
        </ul>
      </div>
      <div class="contact-info">
        <h4>Contact Information</h4>
        <div class="row">
          Email:
          <div class="value col-md-4 col-sm-6 col-xs-10">
            <a href="mailto:hometownharvestllc@gmail.com">hometownharvestllc@gmail.com</a>
          </div>
        </div>
        <div class="row">
          Phone:
          <div class="value col-md-4 col-sm-6 col-xs-10">
            (734) 417-9715
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
