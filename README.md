[![Stories in Ready](https://badge.waffle.io/meet-in-the-middle/meet-me-in-the-middle.png?label=ready&title=Ready)](https://waffle.io/meet-in-the-middle/meet-me-in-the-middle)
# MidUp

An application that helps you, your colleagues and your friends interactively find the perfect place to meet up in the middle.

## Team

  - __Product Owner__: Ko Seunghoon
  - __Scrum Master__: Jordan Genung
  - __Development Team Members__: Jonah Nisenson, Rioa Mattsson

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage
Once logged in, navigate to the My MidUps page and create a MidUp.  A Midup is an interactive map to find the perfect meetup spot. Send invitations to your friends, then click on the newly created MidUp link and you will be taken to your map.  Once you and your friends have joined the MidUp and specified your locations, a midpoint will be calculated.  From there you and your friends can search for, chat about and vote on locations to meet up around the midpoint. 


## Requirements
Angular Google Maps 2.0.19
Socket.io  1.3.5
Mongoose  3.8.25
MongoDB  1.4.35
Node  0.12.0
Express  4.0.0


## Development

### Installing Dependencies

From within the root directory:

```sh
sudo npm install -g bower
npm install
bower install
```
To load Angular Google Maps after you run bower install paste the following into your HTML page:
<\script src='/path/to/lodash[.min].js'></\script>
<\script src='/path/to/angular-google-maps[.min].js'></\script>

### Roadmap

View the project roadmap [here](https://waffle.io/meet-in-the-middle/meet-me-in-the-middle)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
