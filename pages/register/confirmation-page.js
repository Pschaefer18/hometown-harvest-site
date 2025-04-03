import styles from './confirmation-page.css'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';


export default function confirmationPage() {

    const router = useRouter()
    const amount = router.query.amount
    return (
        <div class='body'>
            <h2>Your form has been submitted</h2>
            <h4>Thank you for signing up!</h4>
            <p>Please send ${amount} to Paul Schaefer to confirm your membership</p>
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
            <img src="/MyVenmoQRCode.png" width="150" height="204" alt="venmo QR Code" />
            <p>Venmo Email: paul.r.schaefer11@gmail.com</p>
          </div>
        </div>
        <div class="payment-info">
        Signing up alone does not confirm your membership. Only once your payment has been received is your status as a member confirmed. Spots are limited so be sure to pay as soon as you can to secure your membership!
        </div>
      </div>
      <h6>If you decide to cancel your membership</h6>
      <p>please email hometownharvestllc@gmail.com</p>
    </div>
    )
}