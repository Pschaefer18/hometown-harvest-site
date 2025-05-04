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
import FaqsComponent from "./faqs_component";
import FaqsComponentMobile from "./faqs_component-mobile";

export default function Home() {

  const aboutRef = useRef(null);
  const csaProgramRef = useRef(null);
  const whatWeGrowRef = useRef(null);
  const faqsRef = useRef(null);

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
        <Navbar aboutRef={aboutRef} csaProgramRef={csaProgramRef} whatWeGrowRef={whatWeGrowRef} faqsRef={faqsRef}/>
        <div class="homepage-title-container">
          <h2 style={{lineHeight: "2rem"}}>Registration for the 2025 CSA is now open</h2>
          <a class="sign-up-link" href="/register">Click here to sign up </a>
        </div>
        <img class="homepage-image" src="/HH_Hompage_Image.png"/>
        <section ref={csaProgramRef}>
        <h2 class="section-title">CSA Program</h2>
        <div class="mobile">
          <div class="row">
            <div class="share col-6">
              <img src="/IMG_1513.png" width="230" height="307"/>
              <span>Example of share <br /> in July</span>
            </div>
            <div class="share col-6">
              <img src="/IMG_1655.png" width="230" height="307"/>
              <span>Example of share <br /> in October</span>
            </div>
            <div class="col-12 csa-details">
                <div class="What-to-expect">
                  <h3>What to expect</h3>
                  <p>Each week you'll get a box of freshly harvested produce consisting of a base share plus a few choice items E.g. Broccoli or cauliflower, lettuce or spinach, kale or kohlrabi. All the produce is harvested either the day before or morning of.</p>
                  <ul>
                    <li><b>Full Share - $500</b></li>
                    <li>Beginning the first week of June and ending mid-November</li>
                    <li>24 weeks of produce ~ $21 per week ~ $2.60 per item</li>
                    <li>7-9 items per week</li>
                    <li><b>Half Share - $300</b></li>
                    <li>12 weeks of produce (every other week) ~ $25 per week ~ $2.85 per item</li>
                  </ul>
                </div>
                <div class="Logistics">
                  <h3>Logistics</h3>
                  <p>
                  You can choose to have your share delivered on Tuesdays around 4PM or pick up your share at the garden (5185 Zeeb Rd) on Saturdays 12-6PM. The delivery option costs more starting at an additional $3/week and increases based on your location. The delivery price is revealed upon entering your address when you sign up.
                  </p>
                </div>
                <div class="signup">
                  <button class="signup-btn btn btn-dark" onClick={() => window.location.href = "/register"}>Sign Up Today</button>
                </div>
              </div>
          </div>
        </div>
          
        <div class="desktop">
          <div class="row">
            <div class="col-4 shares">
              <div class="share">
                <img src="/IMG_1513.png" width="230" height="307"/>
                <span>Example of share in July</span>
              </div>
              {/* <div class="csa-definition">
                <p>
                CSA stands for “Community Supported Agriculture”. Today, a CSA is just a subscription where the customer pays upfront and receives a share on a regular basis for some period of time.
                </p>
              </div> */}
              <div class="share">
                <img src="/IMG_1655.png" width="230" height="307"/>
                <span>Example of share in October</span>
              </div>
            </div>
            <div class="col-8 csa-details">
              <div class="What-to-expect">
                <h3>What to expect</h3>
                <p>Each week you'll get a box of freshly harvested produce consisting of a base share plus a few choice items E.g. Broccoli or Cauliflower, Lettuce or spinach, Kale or Kohlrabi. All the produce is harvested either the day before or morning of.</p>
                <ul>
                  <li><b>Full Share - $500</b></li>
                  <li>Beginning the first week of June and ending mid-November</li>
                  <li>24 weeks of produce ~ $21 per week ~ $2.60 per item</li>
                  <li>7-9 items per week</li>
                  <li><b>Half Share - $300</b></li>
                  <li>12 weeks of produce (every other week) ~ $25 per week ~ $2.85 per item</li>
                </ul>
              </div>
              <div class="Logistics">
                <h3>Logistics</h3>
                <p>
                You can choose to have your share delivered on Tuesdays around 4PM or pick up your share at the garden (5185 Zeeb Rd) on Saturdays 12-6PM. The delivery option costs more starting at an additional $3/week and increases based on your location. The delivery price is revealed upon entering your address when you sign up.
                </p>
              </div>
              <div class="signup">
                <button class="signup-btn btn btn-dark" onClick={() => window.location.href = "/register"}>Sign Up Today</button>
              </div>
            </div>
          </div>
        </div>
        
      </section>
      <section ref={whatWeGrowRef}>
        <div class="what-we-grow">
        <h2 class="section-title">What We Grow</h2>
          <h3 style={{marginTop:"30px"}}>2025 Growing Season</h3>
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
                  <div class="row">
                    <div class="col">
                    <h5>Cucurbits</h5>
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
                    <h5>Cucurbits</h5>
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
                    <li>Bok Choy</li>
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
              <h5>Other</h5>
                <ul>
                  <li>Sweet Corn</li>
                  <li>Rhubarb</li>
                  <li>Strawberries</li>
                </ul>
            </div>
          </div>
        </div>
        <div class="what-we-grow-mobile">
        <h2 class="section-title">What We Grow</h2>
        <h5 style={{margin:"15px auto 30px auto"}}>2025 Growing Season</h5>
          <div class="row" style={{textAlign: "left"}}>
            <div class="col-4">
              <h6>Alliums</h6>
              <ul>
                <li>Onions</li>
                <li>Green Onions</li>
                <li>Leeks</li>
                <li>Scallions</li>
                <li>Garlic</li>
              </ul>
            </div>
            <div class="col-4">
              <h6>Brassicas</h6>
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
                <h6>Roots</h6>
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
                <div class="col-4">
                  <h6>Cucurbits</h6>
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
                <div class="col-4">
                  <h6>Nightshades</h6>
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
                <div class="col-4">
                  <h6>Greens</h6>
                  <ul>
                    <li>Spinach</li>
                    <li>Lettuce</li>
                    <li>Bok Choy</li>
                    <li>Komatsuna</li>
                    <li>Tatsoi</li>
                    <li>Mizuna</li>
                    <li>Arugula</li>
                    <li>Baby Kale</li>
                  </ul>
                </div>
              </div>
              <div class="row" style={{textAlign: "left"}}>
                <div class="col-4">
                  <h6>Legumes</h6>
                  <ul>
                    <li>Snap Peas</li>
                    <li>Snow Peas</li>
                    <li>Green Beans</li>
                    <li>Edamame</li>
                  </ul>
                </div>
                <div class="col-4">
                  <h6>Herbs</h6>
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
                <div class="col-4">
                <h6>Other</h6>
                <ul>
                  <li>Sweet Corn</li>
                  <li>Rhubarb</li>
                  <li>Strawberries</li>
                </ul>
                </div>
              </div>
        </div>
      </section>
      <section ref={faqsRef}>
      <h2 class="section-title">FAQs</h2>
              <div class="desktop">
                <FaqsComponent/>
              </div>
              <div class="mobile">
                <FaqsComponentMobile/>
              </div>
      </section>
      <section ref={aboutRef} class="about">
        <h3 class="section-title">About</h3>
        <div class="about-content">
        <p>There’s no question whether the vegetables from a local farm beat what’s in the supermarket, but is it worth the higher price tag? We want to make that decision a no-brainer by growing the highest quality produce and offering the best value to as many people as possible. High quality produce to us means it’s high in nutrients, free of toxins, and great in taste. Visual appeal and customer experience is also important. You may find the occasional bad leaf, but the produce should never be a dirty mess or riddled with bugs.</p>
          <h4>Paul Schaefer</h4>
          <p>I began thinking about being a vegetable farmer at around 15, but didn’t know how realistic it was. I knew that I at least wanted to grow my own vegetables and liked the idea of making it my source of income. Working for a nearby, small farm over the summer in high school, I experienced the difference in food you grow yourself vs the food bought at the supermarket. An heirloom tomato grown with limited watering and fertilizer offered a lot more flavor than the tomatoes I was used to. My life had been a lie. At 19, I went and did a 9 month apprenticeship on <a href="https://www.henrysfarm.com/" target="_ blank">Henry's Farm</a> in Congerville, Illinois. Henry is a real farmer and growing organic vegetables on a small scale is all he’s ever done for a living. Henry also works nearly 100 hours a week and leaves for the Saturday market at 1:00AM.</p>
          {/* <img class="homepage-image" src="/HH_Hompage_Image.png"/> */}
          <p>After Henry’s Farm, I decided that growing vegetables is what I wanted to do with my life, but how to start? Without land, equipment, or any kind of infrastructure, it still did not seem possible. I considered working and saving up to someday start something. Luckily, I did not have to wait. A family just north of Dexter and 3 miles from where I’ve grown up has provided the best situation I could imagine: Land, a tractor, utilities, and some really cool pets too. Best of all, it’s surrounded by a community of like-minded people.</p>
        </div>
      </section>
      <section class="contact-info-section">
        <h4>Contact Information</h4>
        <div class="contact-info">
          <div class="row">
            <div class= 'col-2'>
            Email:
            </div>
            <div class="col-2 value">
              <a href="mailto:paul@hometownharvestllc.com">paul@hometownharvestllc.com</a>
            </div>
          </div>
          <div class="row">
          <div class= 'col-2'>
              Phone:
            </div>
            <div class="col-2 value">
              (734) 417-9715
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
    </>
  );
}
