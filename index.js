/* eslint-disable  func-names */
/* eslint-disable  no-console */

/* jshint -W101 */
// In case I want to interpret multiple languages
// const LocalizationInterceptor = {
//   process(handlerInput) {
//     const localizationClient = i18n.use(sprintf).init({
//       lng: handlerInput.requestEnvelope.request.locale,
//       overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
//       resources: languageString,
//       returnObjects: true
//     });

//     const attributes = handlerInput.attributesManager.getRequestAttributes();
//     attributes.t = function (...args) {
//       return localizationClient.t(...args);
//     };
//   },
// };

// const i18n = require('i18next');
// const sprintf = require('i18next-sprintf-postprocessor');

const Alexa = require('ask-sdk');


function startProgram(handlerInput) {
  const possibleGreetings = [
    'Do you know if your name is hurting you or helping you? Let me help you find out.',
    'Although we often know where our names come from, we may not know how it affects us. But I do.',
    `Names hold power we don't always understand. But together let's find out what power your name has.`
  ];
  
  const randomGreeting = possibleGreetings[Math.floor(Math.random() * 3)];
  const repromptText = `Tell me your gender, male or female`;
  const sessionAttributes = {};
  
  Object.assign(sessionAttributes, {
    repromptText: repromptText,
    gender: '',
    name: '',
    complete: false
  })

  handlerInput.attributesManager.setSessionAttributes(sessionAttributes)

  return handlerInput.responseBuilder
    .speak(`Hello and welcome to What's In A Name. ${randomGreeting} First things first, ${repromptText}`)
    .reprompt(repromptText)
    .getResponse();
}


function isGenderSlotValid(intent) {
  const genderSlotFilled = intent
    && intent.slots
    && intent.slots.Gender
    && intent.slots.Gender.value;

  return genderSlotFilled && (intent.slots.Gender.value === 'male' || intent.slots.Gender.value === 'female');
}


function handleUserGender(handlerInput) {
  const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
  const { intent } = requestEnvelope.request;

  const sessionAttributes = attributesManager.getSessionAttributes();

  let repromptText = 'What is your first name?';

  if (isGenderSlotValid(intent)) {
    const outputString = intent.slots.Gender.value;

    Object.assign(sessionAttributes, {
      repromptText: repromptText,
      gender: outputString,
      name: ''
    });

    return responseBuilder.speak(`So you are ${outputString}, great! Now what is your first name?`)
    .reprompt(repromptText)
    .getResponse();
  }
}

function generateDescription(firstName, gender) {
  const maleAdjectives = {
    a:'strong',
    b:'anxious',
    c:'determined',
    d:'truthful',
    e:'loyal',
    f:'friendly',
    g:'outgoing',
    h:'easygoing',
    i:'unsure',
    j:'prone to spontaneous decisions',
    k:'clearheaded',
    l:'able to stay calm in tough spots',
    m:'fearless',
    n:'intelligent',
    o:`overly conscious of other's opinions`,
    p:'sometimes a little rude',
    q:'a little bit blunt',
    r:`afraid to hurt others' feelings`,
    s:'more concerned with how you look than how you act',
    t:'able to go out of your way for others',
    u:'endlessly kind',
    v:'sincere',
    w:'untrusting',
    y:'a quick learner',
    x:'hard to impress',
    z:'a little bit unique'
  }
  const femaleAdjectives = {
    a:'prone to spontaneous decisions',
    b:'more concerned with how you look than how you act',
    c:'intelligent',
    d:'very concerned with love',
    e:'interested in the unknown',
    f:'extremely outgoing',
    g:'mistrustful at times',
    h:'easygoing',
    i:'unsure',
    j:'determined',
    k:'endlessly kind',
    l:'able to stay calm in tough spots',
    m:'fearless',
    n:'easygoing',
    o:`overly conscious of other's opinions`,
    p:'a little bit unique',
    q:'hard to impress',
    r:`afraid to hurt others' feelings`,
    s:'anxious',
    t:'able to go out of your way for others',
    u:'usually honest, but sometimes insincere',
    v:'extremely honest',
    w:'highly trusting of those around you',
    y:'slow on the uptake, but very precise',
    x:'a little bit blunt',
    z:'sometimes a little rude'
  }
  const adjectives = gender === 'male' ? maleAdjectives : femaleAdjectives;
  let description = '';

  for (var i = 0; i < firstName.length; i++) {
    const current = firstName[i];
    description += adjectives[current] + ',';
  }

  return description.slice(0, -1);
}

function handleUserName(handlerInput) {
  const { requestEnvelope, attributesManager, responseBuilder } = handlerInput;
  const { intent } = requestEnvelope.request;

  const sessionAttributes = attributesManager.getSessionAttributes();
  const firstName = intent.slots.Name.value.toLowerCase();
  const gender = sessionAttributes.gender;
  
  const description = generateDescription(firstName, gender);
  const repromptText = `${description}. Would you like to check another name?`;

  Object.assign(sessionAttributes, {
    repromptText: repromptText,
    name: firstName,
    complete: true
  })

  return responseBuilder.speak(`So your first name is ${firstName}. ${firstName}, ${description}. Would you like to check another name?`)
  .reprompt(repromptText)
  .getResponse();
}

function helpTheUser(handlerInput) {
  const speechOutput = 'Say exit to exit, repeat to repeat the previous question, start over to start from the beginning, and stop to shut me up.'
  return handlerInput.responseBuilder
    .speak(speechOutput)
    .reprompt(speechOutput)
    .getResponse();
}

function IncorrectIntent(handlerInput) {
  let speechOutput = '';
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  if (sessionAttributes.gender === '') {
    speechOutput += 'Sorry, please say if you are male or female';
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse()
  }
  if (sessionAttributes.gender.length > 0 && sessionAttributes.name === '') {
    speechOutput += 'Sorry, please say your first name';
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse()
  }
  if (sessionAttributes.gender.length > 0 && sessionAttributes.name !== '') {
    speechOutput += 'Sorry, please say yes to look for another name or no to exit';
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse()
  }
}

const AnswerGender = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (handlerInput.requestEnvelope.request.intent.name === 'AnswerGender'
        || handlerInput.requestEnvelope.request.intent.name === 'DontKnowIntent');
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if (sessionAttributes.gender !== '') {
      return IncorrectIntent(handlerInput);
    }
    return handleUserGender(handlerInput);
  },
};

const AnswerName = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (handlerInput.requestEnvelope.request.intent.name === 'AnswerName'
        || handlerInput.requestEnvelope.request.intent.name === 'DontKnowIntent');
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if (sessionAttributes.gender === '') {
      return IncorrectIntent(handlerInput);
    }
    return handleUserName(handlerInput);
  },
};


const LaunchRequest = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    
    return request.type === 'LaunchRequest'
    || (request.type === 'IntentRequest'
    && request.intent.name === 'AMAZON.StartOverIntent');
  },
  handle(handlerInput) {
    return startProgram(handlerInput);
  },
};

const HelpIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;
    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return helpTheUser(handlerInput);
  },
};

const RepeatIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    return handlerInput.responseBuilder.speak(sessionAttributes.repromptText)
      .reprompt(sessionAttributes.repromptText)
      .getResponse();
  },
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const YesIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if (sessionAttributes.complete) {
      return startProgram(handlerInput);
    } else {
      return IncorrectIntent(handlerInput);
    }
  },
};

const NoIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    if (sessionAttributes.complete) {
      return handlerInput.responseBuilder.speak('Goodbye!')
        .withShouldEndSession(true)
        .getResponse();
    } else {
      return IncorrectIntent(handlerInput);
    }
  },
};

const StopIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak('')
      .reprompt('')
      .getResponse();
  },
};

const CancelIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent';
  },
  handle(handlerInput) {
    const speechOutput = '';

    return handlerInput.responseBuilder.speak(speechOutput)
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    HelpIntent,
    AnswerGender,
    AnswerName,
    RepeatIntent,
    YesIntent,
    StopIntent,
    CancelIntent,
    NoIntent,
    SessionEndedRequest,
    // ExitIntent
  )
  // .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();
