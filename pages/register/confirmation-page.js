import styles from './confirmation-page.css'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import emailjs from '@emailjs/browser'


export default function confirmationPage() {
    const templateParams = {
        name: 'Paul',
        to_email: 'paul.r.schaefer11@gmail.com'
      };

    useEffect(() => {
            emailjs
            .send('service_6fjtwym', 'template_jav91kj', templateParams, {
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
        }, [])
    const router = useRouter()
    const amount = router.query.amount
    return (
        <div class='body'>
            <h2>Your form has been submitted</h2>
            <h3>Thank you for signing up!</h3>
            <p>Please send ${amount} to Paul Schaefer by May 1st</p>
            <p>Mail checks to the following address or hand deliver to me</p>
            <p>4161 Sunset Ct, Ann Arbor, MI 48103</p>
            <h3>If you decide to cancel your membership</h3>
            <p>please email hometownharvestllc@gmail.com</p>
        </div>
    )
}