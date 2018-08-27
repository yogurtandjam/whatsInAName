# whatsInAName
Simple Alexa Skill Giving Fake User Info

This program takes in a supplied Name and Gender (does not have to be real) and returns a fake name meaning based on the supplied Gender and Name.

No information will be used for any purposes and no information is stored.

Notes:
  Have not yet accounted for duplicate letters giving same meanings
  Have not yet accounted for language localization (servers only US for now)
  AMAZON.USFIRSTNAME property allows almost any string of english letters, so some non name inputs will be accepted.

  Amazon store would not accept "What's in a name" as my skill invocation so for production I altered it back to name analysis
    - But on local amazon dev environment still uses "What's in a name" for activation (will probably change once skill is no longer under review)