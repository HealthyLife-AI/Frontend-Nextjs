# HealthyLife Privacy Policy

## 1. Who we are

HealthyLife is a platform that connects nutritionists with their patients. Nutritionists use a web dashboard to manage patients and meal plans; patients use the HealthyLife mobile app to follow their plan and log meals, weight and measurements. HealthyLife is operated by AbdAlaziz Al-Mufti and the HealthyLife team, Gaza, Palestine ("we", "us").

Two parties handle your information:

- **Your nutritionist** decides what care you receive and what information is needed for it. They see the data you enter in the app and the data they record about you.
- **HealthyLife** runs the platform, stores the data securely, and processes it only to provide the service to you and your nutritionist.

This policy applies to the mobile app, the nutritionist dashboard and the HealthyLife website. Your nutritionist may have their own privacy terms for the care they provide outside the platform.

## 2. Information we collect

We collect only what the service needs. Health information is the most sensitive part, and we treat all of it as confidential.

| Category | Examples | Who provides it |
| --- | --- | --- |
| Account | Name, phone number, username, password (stored only as a one-way hash), language | Your nutritionist creates the account; you can change your password |
| Health profile | Age, sex, height, weight, activity level, goal, medical conditions, medications, allergies and intolerances, food likes and dislikes | You and your nutritionist; changes you propose are applied only after your nutritionist approves them |
| Body measurements | Weight, waist and other circumferences, body-fat percentage, BMI | You and your nutritionist |
| Meal plan and logs | Your plan, the meals and alternatives you log, foods eaten outside the plan | Your nutritionist (plan); you (logs) |
| Questionnaires and requests | Periodic check-in answers, quick requests and notes you send to your nutritionist | You |
| Sleep and wellbeing | Sleep hours and quality, stress, mood, optional notes | You, only if you choose to log them |
| Medical reports | Lab results, imaging, prescriptions or letters you upload | You, only after a separate consent (section 5) |
| Appointments | Booked times and their status | You and your nutritionist |
| Device and technical data | Push-notification token, notification preferences, app version, error and security logs (including IP address and time of access) | Your device and our servers |

We do not collect your location, contacts, photos you do not choose to upload, or payment card details.

## 3. How we use the information

We use your information only to provide nutrition follow-up through the platform:

- show you your meal plan, activities and your nutritionist's instructions;
- let your nutritionist follow your progress, adherence and measurements, and adjust your plan;
- calculate energy needs, nutrition totals and warnings (for example allergens, high glycaemic load or high sodium) for your nutritionist;
- send reminders and notifications you have not turned off;
- keep the platform secure, prevent misuse and fix errors.

We do not sell your data, use it for advertising, or share it with employers, insurers or other third parties for their own purposes. We do not use your personal data to train AI models.

We may use statistics that cannot identify you (for example, how many meals are logged per week across the platform) to improve the service.

## 4. AI features

Some features use an AI language model to draft text for your nutritionist. The AI suggests; your nutritionist decides, and nothing reaches you without their action, except the optional weight-change explanation your nutritionist chooses to show you.

| Feature | What is sent to the AI provider | Who sees the result |
| --- | --- | --- |
| Draft meal plan | Age, sex, height, weight, activity level, goal, calorie target, medical conditions, medications, allergies, lab notes, surgical history, your nutritionist's notes about your case, food likes and dislikes, and the foods available on the platform | Your nutritionist, as an editable draft |
| Plan summary suggestion | Plan totals (calories, protein, carbohydrate, fat), goal, allergy groups | Your nutritionist only |
| Weekly summary | Counts and percentages from your logs for the week (adherence, meals logged, off-plan meals) | Your nutritionist only |
| Weight-change explanation | The change in kilograms, the number of days, adherence level, and yes/no signals such as short sleep; your sex, only to address you correctly | Your nutritionist; you, only if they turn it on |

What is never sent to the AI provider: your name, phone number, username, password, medical reports, free-text notes you write in requests or questionnaires, and your appointments.

The AI provider is Groq. Zero Data Retention is turned on for our Groq account: Groq processes requests in the United States and does not store their content or the replies (\[Groq: Your data\](https://console.groq.com/docs/your-data)). Texts the AI writes for patients are checked automatically before they are shown: they may not mention diagnoses, medicines or calorie numbers, and are replaced with a fixed text if they do.

## 5. Medical reports

Uploading medical reports is optional and needs your separate consent, which you give in the app before the first upload. You can withdraw it at any time.

- **Who can see them:** only you and your nutritionist. Each time a report is opened, we record who opened it and when.
- **How they are stored:** encrypted on our servers, never on a public link. Location data and other hidden details are removed from photos when they are uploaded.
- **What we do not do:** reports are never sent to the AI provider and are not used in summaries or statistics.
- **Limits:** photos or PDF files, up to 10 MB each and 30 reports per account.
- **Deleting:** you can delete any report in the app. It disappears immediately from your account and your nutritionist's view, and the file is permanently erased within 30 days. If you delete your account, all your reports are erased immediately.

Reports are for your nutritionist's context only. A nutritionist is not a physician; questions about test results should go to your doctor.

## 6. Who we share data with

Your data is shared with your own nutritionist only. Other nutritionists on the platform cannot see your data, and you cannot see other patients' data.

We use a small number of service providers to run the platform. They process data only on our instructions and only for the purpose listed.

| Provider | Purpose | Data involved |
| --- | --- | --- |
| Taqat (hosting) | Runs the server and database | All data stored on the platform |
| Vercel | Hosts the nutritionist dashboard website | Data shown to nutritionists while they use the dashboard; nothing stored there |
| Google Firebase Cloud Messaging | Delivers push notifications | Device token and the generic notification text |
| Groq | Drafts and summaries (section 4) | Only the fields listed in section 4 |
| Sentry (EU data region) | Error monitoring | Technical details of server errors; emails, phone numbers, Arabic text, request contents and user details are removed before sending |
| Telegram | Off-site storage of daily database backups | Encrypted backup files only; Telegram cannot read their contents |

We may disclose information if the law requires it, and only to the extent required. If HealthyLife is transferred to another organisation, your data would move only under this policy, and we would tell you first.

## 7. Notifications

Push notifications never contain health information. They use generic text such as "Your nutritionist replied, open the app to read it", because notifications can appear on a locked screen. The details are shown only inside the app after you sign in.

You can turn off each type of notification (meal reminders, morning message, nutritionist tips, measurement reminders) in the app's notification settings, or turn off notifications for the app in your phone's settings.

## 8. Storage, security and retention

Your data is stored on servers located in Gaza, Palestine. The AI provider (section 4) processes the fields listed there in the United States. Connections between the app, the dashboard and our servers are encrypted (HTTPS).

How we protect it:

- passwords are stored only as one-way hashes; sign-in tokens on your phone are kept in the phone's secure storage;
- each nutritionist can access only their own patients, and every request is checked on the server;
- medical reports are encrypted at rest and every access is logged;
- error logs are filtered so they do not contain health data;
- the database is backed up every day. Each backup is encrypted on our server (AES-256) before it leaves it, and the encrypted file is kept off-site with a storage provider that cannot read it, because only HealthyLife holds the key.

How long we keep it:

| Data | Kept for |
| --- | --- |
| Account and health data | While your account is active, and 12 months after follow-up with your nutritionist ends, unless you ask us to delete it sooner |
| Deleted medical reports | Erased within 30 days of deletion |
| Security and access logs | 6 months |
| Backups | Deleted within 30 days |
| AI usage records (token counts and cost only, no text) | 13 months |

When you delete your account, your personal and health data are erased from the live system immediately and from backups within 30 days, as older backups are deleted.

## 9. Your rights and choices

You control your data. You can:

- **see it:** your plan, logs, measurements, requests and reports are in the app; ask us for a full copy at abedalmufti@gmail.com;
- **correct it:** edit your logs and measurements, or ask your nutritionist to correct your health profile;
- **delete it:** delete any meal log, wellbeing entry or report in the app, or delete your whole account from the app's settings;
- **withdraw consent:** for medical reports or data processing in general, in the app or by writing to us. Withdrawing does not affect what was done before;
- **limit notifications and optional features:** turn off notification types, and skip optional logs such as sleep and mood;
- **complain:** contact us first at abedalmufti@gmail.com; we reply within 30 days. You may also contact the data-protection authority where you live, if there is one.

We may ask you to confirm your identity before acting on a request, so that no one else can access or delete your data.

## 10. Children and minors

Patients of any age can be followed on HealthyLife. For a patient under 18, the nutritionist creates the account only with the consent of a parent or legal guardian, who then acts for the patient under this policy and can use all the rights in section 9. For patients under 18, the platform does not apply adult calorie limits or automatic calorie deficits.

## 11. Changes and contact

If we change this policy in a way that affects how your data is used, we will tell you in the app before the change takes effect and, where the law or this policy requires it, ask for your consent again. The date at the top shows the current version.

For any question or request about your data, contact AbdAlaziz Al-Mufti at abedalmufti@gmail.com, Gaza, Palestine.
