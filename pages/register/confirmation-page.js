import styles from './confirmation-page.css'
import { useRouter } from 'next/router'

export default function confirmationPage() {
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