import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight, faSleigh } from "@fortawesome/free-solid-svg-icons";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import FAQs from "../FAQs";
import styles from "./faqs_component.module.css";


const FaqsComponentMobile = () => {
    const [isOpen, setIsOpen] = useState(Array(FAQs.length).fill(false));
    const toggleFaq = (key) => {
      var newArray = [...isOpen];
      newArray[key] =!isOpen[key];
      setIsOpen(newArray);
    }
    return (
    <div class={styles.csaFaq}>
          <h4>CSA Questions</h4>
            <ul>
              {FAQs.filter(faq => faq.category === "CSA").map((faq) => (
                <li key={faq.id}>
                  <div class={styles.faq} onClick={() => toggleFaq(faq.id)}>
                    <FontAwesomeIcon icon={isOpen[faq.id] ? faCaretDown : faCaretRight} width="20px" height="20px" class={`icon`} style={{width: "20px", height: "20px"}}/>
                    <h6>{faq.question}</h6>
                  </div>
                  <p className={`${styles.faqAnswer} ${isOpen[faq.id] ? styles.open : styles.closed}`}>
                    {faq.answer.split(' ').map((word, index) => (
                      <span key={index}>
                        {word === "**link**" ? (
                          <a href={faq.link.href}>
                            {faq.link.placeholder}
                          </a>
                        ) : (
                          word
                        )}
                        {' '}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
            <ul>
              <h4>Other Questions</h4>
              {FAQs.filter(faq => faq.category !== "CSA").map((faq) => (
                <li key={faq.id}>
                  <div class={styles.faq} onClick={() => toggleFaq(faq.id)}>
                    <FontAwesomeIcon icon={isOpen[faq.id] ? faCaretDown : faCaretRight} width="20px" height="20px" class="icon" style={{width: "20px", height: "20px"}}/>
                    <h6>{faq.question}</h6>
                  </div>
                  <p className={`${styles.faqAnswer} ${isOpen[faq.id] ? styles.open : styles.closed}`}>
                    {faq.answer.split(' ').map((word, index) => (
                      <span key={index}>
                        {word === "**link**" ? (
                          <a href={faq.link.href}>
                            {faq.link.placeholder}
                          </a>
                        ) : (
                          word
                        )}
                        {' '}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </div>
    )
}
export default FaqsComponentMobile;