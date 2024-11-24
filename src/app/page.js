"use client"; // This is a client component 

import Image from "next/image";
import "./globals.css";
import Head from "next/head";
import 'bootstrap/dist/css/bootstrap.min.css';
import {db} from "./firebase"
import {collection, addDoc} from 'firebase/firestore';
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Carousel from "../components/Carousel";
import Navbar from "@/components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight, faSleigh } from "@fortawesome/free-solid-svg-icons";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";


export default function Home() {
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
      question: "What is the best way to contact you?",
      answer: "If it's a timely or important matter regarding your share pickup or delivery, please call or text me at (734)-417-9715. Otherwise you can email hometownharvestllc@gmail.com, I just may not see it right away. If I don't respond to an important email, just call or text."
    },
    {
      question: "What if I’m gone for a week and can’t pick up my share?",
      answer: "If you know ahead of time that you'll be absent for a CSA pickup/delivery, please text me as soon as you can. As long as I'm aware before harvesting time, you'll be able to receive a double share the following week. This does not, however, carry over for a third week. If you fail to notify me, someone will eat your share and you won't be getting a double share."
    },
    {
      question: "What if I forget to pick up my share?",
      answer: "I understand that many of my members have chaotic lives and picking up a box of produce might not be of top priority. If you realize you forgot to pick up your share, it will be held for 24 hours, and you can pick it up the next morning. After that, someone will eat it. I don’t plan to keep track of who’s picked up and who hasn’t, so I won’t be able to notify you if you forget."
    },
    {
      question: "Can I come visit?",
      answer: "Yes, whether you’ve already signed up or are considering signing up, you are always welcome to come visit. Just be sure to message me (734-417-9715) in advance to set up a time."
    }
  ]
  const aboutRef = useRef(null);
  const csaProgramRef = useRef(null);
  const [isOpen, setIsOpen] = useState(Array(FAQs.length).fill(false));
  const toggleFaq = (key) => {
    var newArray = [...isOpen];
    newArray[key] =!isOpen[key];
    setIsOpen(newArray);
  }

  return (
    <>
    <Head>
      <title>Homepage</title>
    <link
      rel="stylesheet"
      href="/page.module.css"
    />
    </Head>
    <div class="homepage">
      <div class="body">
        <Navbar aboutRef={aboutRef} csaProgramRef={csaProgramRef}/>
        <div class="homepage-title-container">
          <h1>Registration for the 2025 CSA is now open</h1>
          <a class="sign-up-link" href="/register">Click here to sign up </a>
        </div>
        <img class="homepage-image" src="/HH_Hompage_Image.png"/>
        <section>
        <h2 ref={csaProgramRef}class="section-title">CSA Program</h2>
        <div class="share-examples">
          <div class="share">
            <img src="/IMG_1513.png" width="230" height="307"/>
            <h7>Example of share in July</h7>
          </div>
          <div class="csa-definition">
            <p>
            CSA stands for “Community Supported Agriculture”. Today, a CSA is just a subscription where the customer pays upfront and receives a share on a regular basis for some period of time.
            </p>
          </div>
          <div class="share">
            <img src="/IMG_1655.png" width="230" height="307"/>
            <h7>Example of share in October</h7>
          </div>
        </div>
        <div class="csa-info">
          <div class="What-to-expect">
            <h3>What to expect</h3>
            <p>
            The program runs 24 weeks from the first week of June into early November. A typical share will have 7 to 9 items. At about $21 per share, you’re looking at $2.50 per item (examples of items shown above). I intend to provide good variety from week to week, however, this does rely on crop success. I also intend to provide choices between items.
            </p>
          </div>
          <div class="Logistics">
            <h3>Logistics</h3>
            <p>
            You can choose to have your share delivered on Tuesdays around 4PM or pick up your share at the garden (5185 Zeeb Rd) on Saturdays 12-6PM. The CSA costs $500 if you elect to pick up at the garden. The delivery option costs more starting at an additional $3/week and increases based on your location. The delivery price is revealed upon entering your address when you sign up.
            </p>
          </div>
        </div>
        <div class="signup">
        <button class="sign-up-button" onClick={() => window.location.href = "/register"}>Sign up Today!</button>
        </div>
        <div class="what-i-grow">
          <h3 style={{marginTop:"30px"}}>What I plan to grow in 2025</h3>
          <div class="row">
            <div class="col">
              <div class="row">
                <div class="col">
                  <h5>Alliums</h5>
                  <ul>
                    <li>Onions</li>
                    <li>Green Onions</li>
                    <li>Leeks</li>
                    <li>Scallions</li>
                    <li>Garlic</li>
                  </ul>
                </div>
                <div class="col">
                  <h5>Brassicas</h5>
                  <ul>
                    <li>Broccoli</li>
                    <li>Cauliflower</li>
                    <li>Cabbage</li>
                    <li>Collard Greens</li>
                    <li>Kale</li>
                    <li>Kohlrabi</li>
                  </ul>
                </div>
                <div class="col-6">
                  <h5 style={{textAlign: "center"}}>Cucurbits</h5>
                  <div class="row">
                    <div class="col">
                      <ul>
                        <li>Zucchini</li>
                        <li>Yellow Squash</li>
                        <li>Spaghetti Squash</li>
                        <li>Cucumbers</li>
                        <li>Watermelon</li>
                        <li>Cantaloupe</li>
                      </ul>
                    </div>
                    <div class="col">
                      <ul>
                        <li style={{fontWeight: "bold"}}>Winter Squash</li>
                        <li>Delicata</li>
                        <li>Kabocha</li>
                        <li>Butternut</li>
                        <li>Pie Pumpkins</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <h5>Greens</h5>
                  <ul>
                    <li>Spinach</li>
                    <li>Lettuce</li>
                    <li>Bok Choi</li>
                    <li>Komatsuna</li>
                    <li>Tatsoi</li>
                    <li>Mizuna</li>
                    <li>Arugula</li>
                    <li>Baby Kale</li>
                  </ul>
                </div>
                <div class="col">
                  <h5>Roots</h5>
                  <ul>
                    <li>Radishes</li>
                    <li>Baby Radishes</li>
                    <li>Turnips</li>
                    <li>Beets</li>
                    <li>Carrots</li>
                    <li>Potatoes</li>
                    <li>Sweet Potatoes</li>
                  </ul>
                </div>
                <div class="col">
                  <h5>Legumes</h5>
                  <ul>
                    <li>Snap Peas</li>
                    <li>Snow Peas</li>
                    <li>Green Beans</li>
                    <li>Edamame</li>
                  </ul>
                </div>
                <div class="col">
                  <h5>Herbs</h5>
                  <ul>
                    <li>Dill</li>
                    <li>Cilantro</li>
                    <li>Parsley</li>
                    <li>Oregano</li>
                    <li>Thyme</li>
                    <li>Sage</li>
                    <li>Rosemary</li>
                    <li>Mint</li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="col-2" style={{textAlign: "left"}}>
              <h5>Nightshades</h5>
                <ul>
                  <li style={{fontWeight: "bold"}}>Tomatoes</li>
                  <li>heirlooms</li>
                  <li>hybrids</li>
                  <li>cherry</li>
                  <li style={{fontWeight: "bold"}}>Peppers</li>
                  <li>Bell</li>
                  <li>Poblano</li>
                  <li>Jalepeno</li>
                  <li>Hungarian Hot Wax</li>
                  <li style={{fontWeight: "bold"}}>Eggplant</li>
                </ul>
            </div>
          </div>
        </div>
        <div class="what-i-grow-mobile">
          <h3 style={{marginTop:"30px"}}>What I plan to grow in 2025</h3>
          <div class="row" style={{textAlign: "left"}}>
            <div class="col-4">
              <h5>Alliums</h5>
              <ul>
                <li>Onions</li>
                <li>Green Onions</li>
                <li>Leeks</li>
                <li>Scallions</li>
                <li>Garlic</li>
              </ul>
            </div>
            <div class="col-4">
              <h5>Brassicas</h5>
              <ul>
                <li>Broccoli</li>
                <li>Cauliflower</li>
                <li>Cabbage</li>
                <li>Collard Greens</li>
                <li>Kale</li>
                <li>Kohlrabi</li>
              </ul>
            </div>
              <div class="col-4">
                <h5>Roots</h5>
                <ul>
                  <li>Radishes</li>
                  <li>Baby Radishes</li>
                  <li>Turnips</li>
                  <li>Beets</li>
                  <li>Carrots</li>
                  <li>Potatoes</li>
                  <li>Sweet Potatoes</li>
                </ul>
              </div>
              </div>
              <div class="row" style={{textAlign: "left"}}>
                <div class="col-6">
                  <h5 style={{textAlign: "center"}}>Cucurbits</h5>
                  <ul>
                    <li>Zucchini</li>
                    <li>Yellow Squash</li>
                    <li>Spaghetti Squash</li>
                    <li>Cucumbers</li>
                    <li>Watermelon</li>
                    <li>Cantaloupe</li>
                    <li style={{fontWeight: "bold"}}>Winter Squash</li>
                    <li>Delicata</li>
                    <li>Kabocha</li>
                    <li>Butternut</li>
                    <li>Pie Pumpkins</li>
                  </ul>
                </div>
                <div class="col-2" style={{textAlign: "left"}}>
                  <h5>Nightshades</h5>
                    <ul>
                      <li style={{fontWeight: "bold"}}>Tomatoes</li>
                      <li>heirlooms</li>
                      <li>hybrids</li>
                      <li>cherry</li>
                      <li style={{fontWeight: "bold"}}>Peppers</li>
                      <li>Bell</li>
                      <li>Poblano</li>
                      <li>Jalepeno</li>
                      <li>Hungarian Hot Wax</li>
                      <li style={{fontWeight: "bold"}}>Eggplant</li>
                    </ul>
                </div>
              </div>
              <div class="row">
                <div class="col">
                  <h5>Greens</h5>
                  <ul>
                    <li>Spinach</li>
                    <li>Lettuce</li>
                    <li>Bok Choi</li>
                    <li>Komatsuna</li>
                    <li>Tatsoi</li>
                    <li>Mizuna</li>
                    <li>Arugula</li>
                    <li>Baby Kale</li>
                  </ul>
                </div>
                <div class="col">
                  <h5>Legumes</h5>
                  <ul>
                    <li>Snap Peas</li>
                    <li>Snow Peas</li>
                    <li>Green Beans</li>
                    <li>Edamame</li>
                  </ul>
                </div>
                <div class="col">
                  <h5>Herbs</h5>
                  <ul>
                    <li>Dill</li>
                    <li>Cilantro</li>
                    <li>Parsley</li>
                    <li>Oregano</li>
                    <li>Thyme</li>
                    <li>Sage</li>
                    <li>Rosemary</li>
                    <li>Mint</li>
                  </ul>
                </div>
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
      </section>
      <section ref={aboutRef} class="about">
        <h3 class="section-title">About</h3>
        <p>My name is Paul and I’ve started a garden located on Zeeb Rd just North of Daly (5185 Zeeb). I do not own the land, but the owners have made me feel like I do. In the first year (2024) I grew about 45 different types of vegetables on an acre plot and offered a 25 week CSA to 25 members. For the 2025 season, I plan to increase the plot, grow a few more types of vegetables and scale up the CSA program to 60 people. I also plan to sell some produce at the Whitney Farmstead (5525 Jennings Rd) on Wednesdays.</p>
        <h4>Growing Practices</h4>
        <p>Growing vegetables on a small scale and serving customers directly has great advantages. Because the product is not being shipped across the country, I can select varieties that focus on taste instead of durability or shelf life. Things like tomatoes and strawberries can ripen naturally. Pests are kept in check through ecological diversity as opposed to chemical intervention. Growing many different things eliminates the chance that a single pest wipes everything out. I have chosen to go heavy on compost and not rely much on the existing clay loam. Rich and friable soil makes everything easier from seeding to harvesting. This has led me to start making large amounts of compost which hold numerous other benefits like being free of weed seeds and pathogenic viruses, bacteria, and fungi by way of its high temperature treatment process. A thick layer of finished compost is a better solution to diseases like blight than applying fungicides. All of this means that the produce coming out of the garden should be superior in every way to what you’ll find at the supermarket.</p>
        <h4>Mission</h4>
        <p>The goal is to grow as much of the highest quality produce possible and to give members the best deal available. High quality produce to me means it’s high in nutrients, free of toxins, and great in taste. Visual appeal and customer experience is also important to me. You may find the occasional cabbage worm, but the produce should never be a dirty mess or riddled with bugs.</p>
        <p>Supermarket shopping can be a headache not having confidence in the products you buy. Were these strawberries sprayed with neurotoxins? Is it worth buying organic? ...hard to know. I’m glad to provide members with the peace of mind that the food you receive each week has no negative health risks attached.</p>
      </section>
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
