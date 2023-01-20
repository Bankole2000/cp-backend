# Project plan

## SECTION: Big Project Ideas

-----------------------------

Event centers & other special listings
Admin section

-----------------------------

## SECTION: Project Overview

-----------------------------

  Cribplug is an app that helps 4 kinds of people

  1. people who want to make money by hosting others in spare rooms or cohabitable living spaces
  2. people who want are looking for a place to stay for a short while
  3. people who are looking for a place to rent and want to share the costs by cohabiting
  4. Real estate agents and landlords who are looking for prospective tenants

-----------------------------

SECTION: User roles
-----------------------------

  Naturally, the above description gives rise to 4 major user roles

  1. Host (offering shared/solo living space)
  2. Seeker (searching for a living space)
  3. Potential Co-renter (searching for a cohabitor)
  4. Real Estate Agents & landlords (offering rentable space)
  NOTE: supplementary users - necessary for the running of the app
    - app admin
    - tech support

-----------------------------

## SECTION: user stories

-----------------------------

  1. User Host signs up -
    Once and only when logged in can user
    - post a listing for a spare room or cohabitable space
      Said listing will include such details as
        - location { address, town, city, and state }
        - bookable periods { 1 night, a weekend, a week, 2 weeks, 4 weeks (a month), 2 months, 3 months, and 6 months (max) }
        - relative price for each bookable period
        - Short Description (required)
        - Long description (optional)
        - Amenities { water, power etc}
        - Rules { curfews, smoking, pets, infants etc }
        - geographical location (google maps?)
        - Any other details

    - once a listing has been sufficiently detailed, the host can 
      (1) Save for editing later 
      (2) Save and publish listing 
      (3) unpublish listing
      (4) edit/update listing
      (5) delete listing 
    - After posting/published listing, host can 
      Invite seekers and co-renters to view listing or to chat
      - Invite to view notifies invitee via email & is stored in app inbox
      - Invite to chat notivies invitee via email & is stored in app chat   
    NOTE: rooms can only be booked when they are available and published
    non-published listings will not appear in searches
    - non-booking users can like/favorite, and share above posted listing, 
    - users who have booked a listing can perform the above actions as well as 
    rate, and review/comment on and recommend / not recommend posted listing
    NOTE: Booking request must be approved by host to be finalized.
      i.e. Booking must be confirmed by host to be registered as successful booking.
  
  2. User seeker signs up -
    - [guest] Is shown a list of featured listings (using current location)
    - [guest] can search for listing in a particular area (by state or city)
    - [guest] can filter search results by price, amenities, rules, bookable period, or any other variable
    - [logged in] can like/favorite, share listings
    - [logged in] can book published listings (payment options?)
    - [logged in and has booked] can rate/review/recommend listing and/or listing publisher/host.
    - [guest] can view listing details
    - [guest] can view host profile details
    - [logged in] can chat with host, other users
  
  3. User Co-renter signs up -
    - [guest] is shown a list of featured co-renter listings (using current location)
    - [guest] can search for people willing to co-rent by location
    - [guest] users can filter search results by price, gender, budget, etc
    - [guest] user can view details of co-rent offers and profiles of co-renter offerer
    - [logged in] user can Invite other users to chat
    - [logged in] user can choose to "match" listing if co-rent
      Matching co-rent listing notifies poster via email
    - [logged in] user can post intent to rent or co-habit
      - Intent to rent or co-habit post must contain the following details
        - preferred location
        - willing to co-habit or rent solo
        - budget
        - preferred type of place (self-con, 1 room, 2 bedroom, )  
        - preferred amenities
        - preferred rules
        - short public bio
        - any special needs? (e.g. allergies, is parent).
  4. Real Estate Agent signs in
    - [logged in] Applies for Real estate agent/landlord role
    - [Approved REA] Can CRUD and publish RE Listing
    - [Approved REA] Can invite users to view RE Listing
    - [Approved REA] Can invite users to chat


## SECTION: App Overview / Layout  

---------------------------------

  Profile
    - Account details - View, edit/update, change password
      - First name, last name, email, phone, bio, profile pic
    - View Bookings - Requested and/or approved.
    - View/edit self-posted listings,
    - View liked/Favorite listings,
    - View/edit self-posted rent/co-rent offers
    - View liked/Favorited rent/co-rent offers
    - [Real Estate Agent - REA] View/edit self-posted RE listings,
    - View liked/Favorite RE listings
  Find a place
    - Temporary { for shared/solo short-term living spaces}
    - Long-term { for Real Estate Listings }
  Host a guest
    - Create a hosting offer
    - View Hosting Offers created and Details
  Messages
    - Chat - full page  
    - Invitations
    - Inquiries sent.
  Real Estate Agency
    - Apply as a Real Estate Agent / Landlord
      - Application must include Certificate from aean.ng or reputable institution
      - [ if Landlord ] Application must include copy of C/O.
      - Application must be approved to obtain [Approved REA] role  
    - [ Approved REA ] Create and publish RE Listing Offer
    - [ Approved REA ] View Created RE listings,
      - View Details of single RE listing including
        - Those who liked, Comments, Reviews, Rating etc...
  Support
    - Contact admin - raise support ticket
    - View support tickets.

## SECTION: App Admin / Support

  Admin route should cover

- Analytics
  - Track metrics, traffic, Server health/status, generate reports etc.
- CRUD users, solo/shared listings, co-rent intent listings, RE Listings
- Approve REA Applications
- Handle Support tickets
- Create Broadcast Messages

## SECTION: Database Overview

  App will use REST & Sockets

- Entities
      USER Entity
      HOST Entity
      HOST_OFFER
      CORENT_OFFER Entity
      REALESTATE_OFFER Entity  
- Relationships
      USER can be HOST [1-1]
      USER can be REA [1-1]
      USER has HOST_OFFER [1-N]
      USER has CORENT_OFFER [1-N]
      USER has REALESTATE_OFFER [1-N]
  { to be continued }

## SECTION: Site Map (pages & routes)

  { to be continued }

## SECTION: Ideas

- Services to help with moving
- Community tab - similar to social network people can post random stuff
  - community stories
- Group chat
- Notifications - Notification types
  - Invite to chat
  - Invite to view Listing
  - Invite to view property
  - Messages from admin
    - Account suspension
    - Response to Support tickets
    - General messages
  - Welcome messages e.g. getting started
    - On First Signup  
  - View Notification History
    - Timeline of notifications
    - Timeline of Activities

Each link has five different states: link, hover, active, focus and visited.

Link is the normal appearance, hover is when you mouse over, active is the state when it's clicked, focus follows active and visited is the state you end up when you unfocus the recently clicked link.

<span class="grey--text text--lighten-1">4</span>

Airbnb questions
  Step 1. What kind of place do you have
    - place type - Options - ['Entire Place', 'Private Room', 'Shared Room']
    - For how many guests? Options - 1 - 16 guests ✔️
    - Location - Google maps Places autocomplete search.

  Step 2. What kind of place are you listing
    - place type - options - ['Apartment', 'House', "Sec Unit", 'Unique space', 'Bed and Breakfast', 'Boutique Hotel']
    - property type - options depending on place type
      ['Apartment'] => ['Apartment', 'Condomimium', 'Casa Particular (Cuba)', 'Loft', 'Serviced Apartment']
      ['House'] => ['House', 'Bungalow', 'Cabin', 'Casa Particular (Cuba)', 'Chalet', 'Cottage', 'Cycladic House (Greece)', 'Dammuso (Italy)', 'Dome House', 'Earth House', 'Farmstay', 'Houseboat', 'Hut', 'Light House', 'Pension (South Korea)', 'Shepherds Hut (U.K France)', 'Tiny House', 'Town House', 'Trullo (Italy)', 'Villa']
      ['Secondary Unit'] => ['Guest House', 'Guest Suite', 'Farm Stay']
      ['Unique Space'] => ['Barn', 'Boat', 'Bus', 'Camper/RV', 'CampSite', 'Castle', 'Cave', 'Dome house', 'Earth House', 'Farm stay', 'House boat', 'Hut', 'Igloo', 'Island', 'Lighthouse', 'Pension (South Korea)', 'Plane', 'Shepherds Hut (U.K France)', 'Tent', 'Tiny House', 'Tipi', 'Train', 'Treehouse', 'Windmill', 'Yurt', 'Komika (Japan)']
      ['Bread and Breakfase'] => ['Bed n breakfast', 'Casa Particular', 'Farmstay', 'Minsu (Taiwan)', 'Nature Lodge', 'Ryokan (Japan)']
      ['Boutique Hotel'] => ['Boutique Hotel', 'Aparthotel', 'Heritage Hotel (India)', 'Hostel', 'Hotel', 'Nature Lodge', 'Resort', 'Serviced Apartment', 'Kezhan (China)']

      ** Added by me **
      Commercial Listings
      [Office Space] => 
      [Shop Space] =>
      [Kiosk] =>

      Events
      [Event Hall] =>
      [Conference Room] =>
      [Outdoor Venue] =>

      ON select => Modal - THis listing will go through review - Text content e.g. {A Bed & Breakfast on Airbnb should be a licensed hospitality business and will go through review to make sure it meets our criteria. This helps listings appear in the right searches and lets guests know what to expect.
                            If that doesn’t sound like this property, change the property type.
                            Learn more}

    - What will guests have?
     [Radio options] -  
      [ ] Entire place
      Guests have the whole place to themselves. This usually includes a bedroom, a bathroom, and a kitchen.
      [ ] Private room
      Guests have their own private room for sleeping. Other areas could be shared.
      [ ] Shared room
      Guests sleep in a bedroom or a common area that could be shared with others.

    - Is this set up as a dedicated guest space?
      [ ] Yes, it’s primarily set up for guests
      [ ] No, I keep my personal belongings here

    - Are you listing on Airbnb as part of a company?
      [ ] I’m hosting as a registered business
      [ ] I’m hosting as an individual or sole owner

    This helps you get the right features for how you host—it won’t show up to guests or impact how you show up in search.

  Step 3: How many guests can your place accomodate?
    check that you have enough beds to accommodate all your guests comfortably.
    Guests = + or -
    How many beds can guests use
    no of beds
    Sleeping arrangements (Sharing the types of beds in each room can help people understand the sleeping arrangements)
    Bedroom (0 beds, btn - add beds) , Common Space (0 beds, btn - add beds)
    on add bed click
    Bedroom type of beds ['Double', 'Queen', 'Single', 'Sofa Bed']
    Common Space type of beds ['Sofa bed', 'couch', 'floor Mattress', 'water bed', 'King Size', 'bunk bed', 'air mattress']

  Step 4: How many bathrooms?
  Step 5: Where is your place located? (Guests will only get your exact address once they've booked a reservation)
  options => [ 🗺️ Use Current location ] or enter location data
  location data
    - Country / Region [auto fill with current county]
    - Street Address (House name / number + street / road)
    - Apt, suite. (OPtional)
    - City, state, Zip Code
  If USe current location unavailable prompt user to use location form

  Step 5 - Is the Pin in the right place?
    text {If needed, you can adjust the map so the pin is in the right location. Only confirmed guests will see this, so they know how to get to your place.}
    - Google maps move pin.
  
  Step 6 - What amenities do you offer ?
        What amenities do you offer?
      These are just the amenities guests usually expect, but you can add even more after you publish.
    Check boxes
Essentials
Towels, bed sheets, soap, toilet paper, and pillows

Wifi

TV

Heat

Air conditioning

Iron

Shampoo

Hair dryer

Breakfast, coffee, tea

Desk/workspace

Fireplace

Closet/drawers

Safety amenities

Smoke detector
Check your local laws, which may require a working smoke detector in every room

Carbon monoxide detector
Check your local laws, which may require a working carbon monoxide detector in every room

First aid kit

Fire extinguisher

Lock on bedroom door
Private room can be locked for safety and privacy

Step 6 - What spaces can guests use?
Include common areas, but don’t add spaces that aren’t on your property.

Kitchen

Laundry – washer

Laundry – dryer

Parking

Gym

Pool

Hot tub

Does your space have accessibility features?
Every month, thousands of guests search for listings with accessibility features. Adding these features can help your listing get more attention and makes travel possible for more people.

You’ll have the chance to tell guests which accessibility features you have once you’ve finished listing your space. We can remind you to add these features and show you how to take good photos of them.
Email me about adding accessibility features later [switch]

Step 7 - Liven up your listing with photos
Take photos using a phone or camera. Upload at least one photo to publish your listing—you can always add more or edit later.
[option to skip][image area upload][tips for quality photos]
Tips for quality photos => Tips for quality photos
Declutter your space
Use natural daylight and avoid flash
Shoot from room corners in landscape mode
Balance visible floor and ceiling space
Highlight special decor and amenities
Add photos of every room guests can access

Step 8
Describe your place to guests
Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.
500
Your space (optional)
Describe the look and feel of your space. Point out any special design elements or areas, like a cozy reading corner or outdoor seating.
Your interaction with guests (optional)
Share how available you'll be during a guest’s stay. For your safety, don't share your phone number or email until a reservation is confirmed.
Your neighborhood (optional)
Share what makes your neighborhood special, such as the vibe, nearby cafes, a unique landmark, or a walkable destination.
Getting around (optional)
Add info about getting around your city or neighborhood, like nearby public transportation, driving tips, or good walking routes.

Step 9
Create a title for your listing
Catch guests’ attention with a listing title that highlights what makes your place special.
e.g. Abuja Home with a View

Step 10
Add your photo = options [ use facebook photo ][upload photo]
hint Make sure the photo clearly shows your face.

on image uplaod -
This photo will be added to your profile. It will also be seen by hosts or guests—so be sure it doesn’t include any personal or sensitive info.

Step 11
Mobile number verification
Add your mobile number
We’ll send you booking requests, reminders, and other notifications. This number should be able to receive texts or calls.
Phone Country Select

Nigeria (+234)
Phone Number Input
+234
Verify
Back
Next
Coming up, we’ll ask if it’s OK for guests to use this number to contact you. If it’s not OK, you can add another number for guests to use.

+234 806 916 6906
Verified
Can guests use this number to get in touch with you?
Can guests use this number to get in touch with you?
 Yes, guests can use this number
 No, add another number for guests

Review Airbnb’s guest requirements
Airbnb has requirements that all guests must meet before they book.
All Airbnb guests must provide:
Email address
Confirmed phone number
Payment information
Before booking your home, each guest must:
Agree to your House Rules
Message you about their trip
Let you know how many guests are coming
Confirm their check-in time if they’re arriving within 2 days

Add additional requirements

Government-issued ID submitted to Airbnb

Recommended by other hosts and have no negative reviews
More requirements can mean fewer reservations.

Set house rules for your guests
Guests must agree to your house rules before they book.
Suitable for children (2-12 years)

Suitable for infants (Under 2 years)

Suitable for pets

Smoking allowed

Events allowed

Additional rules
Quiet hours? No shoes in the house?
Add
Details guests must know about your home

Must climb stairs

Potential for noise

Pet(s) live on property

No parking on property

Some spaces are shared

Amenity limitations

Surveillance or recording devices on property

Weapons on property

Dangerous animals on property

Add descriptions to details on click

Review your guest requirements
Guests can only book without sending a request if they meet all your requirements and agree to your house rules.
Airbnb’s guest requirements
Email address
Confirmed phone number
Payment information
A message about the guest’s trip
Check-in time for last minute trips
Review
Your additional requirements
No additional requirements

Edit
Your House Rules
Smoking allowed
Not suitable for children and infants
No pets
No parties or events
Edit
Back
Next
Guests will only be able to book instantly with you if they meet all these requirements and agree to your House Rules.

Menu options:

1. Messages,
2. Notifications,
3. My Listings (user Listings CRUD),
4. My Rentals,
5. My Offers,
6. My Likes,
7. Chat,
8. Dashboard,
9. Bookings,
10. Support / Feedback,
11. Help & Info,
12. Transactions,

Socket.io notes
SERVER SIDE
// sends to the single specific socket connecting
socket.emit('event', {data})

// sends to all except specific socket
socket.broadcast.emit('event', {data})

// sends to all connected clients sockets
io.emit('event', {data})

// Runs on client disconnect
socket.on('disconnect', (data) => {})  

Edit: This is now possible

You can now simply call socket.disconnect() on the server side.

//// Traversy media example

# region

const botName = 'ChatCord Bot';

// Run when client connects
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Runs when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

# endregion

// Vue Vuex Sockets example
// In component
export default {
  data () {
    return {
      message: '',
      response: 'Server has not yet replied.'
    }
  },
  methods: {
    emitEvent () {
      this.$socket.emit('hello_world', this.message)
    }
  },
  created () {
    this.$options.sockets.hello_world = (data) => {
      this.response = data
    }
  }
}

First, we have to initialize the listener — this is done in the created lifecycle hook so as soon as our component is created, it will begin listening. We then a key on the this.$options.sockets object to a callback function. This sockets object tracks all of our listeners. Under the hood, Vue-SocketIO reads all of the values in this object and registers listeners. Similarly, when a listener is deleted, it unregisters the listener.

export default new Vuex.Store({
  state: {
    connected: false,
    error: '',
    message: '',
  },
  mutations: {
    SOCKET_CONNECT(state) {
      state.connected = true
    },
    SOCKET_DISCONNECT(state) {
      state.connected = false
    },
    SOCKET_MESSAGE(state, message) {
      state.message = message
    },
    SOCKET_HELLO_WORLD(state, message) {
      state.message = message
    },
    SOCKET_ERROR(state, message) {
      state.error = message.error
    },
  },
})
Registering a listener using Vuex is as simple as adding a mutation prefixed with SOCKET_. The text after this prefix is the name of our channel we want to listen to. To convert the listener from our previous example, which listened on the channel hello_world, we simply create a mutation named SOCKET_HELLO_WORLD. Our server’s response to our message can now be shared with our other components!

Notifications:

- Fields
    image,
    type of notification,
    when sent,
    primary info (title),
    secondary info (desc),
    details,
    link

Notifications for:

  1. bell - Invite sent - on reciever side
  2. bell - ping sent - on reciever side
  3. bell - Invite accepted/decline - on sender side
  4. chat - message sent - on reciever side if dialog not opened
  5. email - Invite sent - reciever offline
  6. email (confirm) chat - message sent - reciever offline

Colors:
primary : "#2EB4FF", #476EF9
secondary: "#FF377F",
info: "#26a69a",
accent: "#FF7D6D",
warning: "#FDD769",
success: "#2DC369",
error: "#FF3030",

Nuxt default colors:

dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        },
        light: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }


User Incentives
 - Gamification
 - Fun + New (+safety)
 - Feedback loop
 - Some kind of point system
 - Referral bonuses
 - Referral statistics (gamified referrals)
 - User Badges & awards.
 - (Gas - case study)
 - Democratization of real-estate (anyone can be a real-estate agent)

Plan
 - Marketing
 - MVP
 - Business side of things
 - End goal
 - Business model
 - What user needs are fulfilled by the app
 - Technical prioritization - User prioritization
 - 