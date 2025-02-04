# Introduction
This repository holds a demonstration consumer application which uses IBM Security Verify to provide registration, policy-based authentication (first-factor and optional multi-factor), and account management.  It uses the IBM Security Verify Adaptive SDK for all functionality.

A cookbook which uses this application, with step-by-step setup instructions and exploration of the associated REST APIs using Postman, is available on IBM Security Learning Academy.  [Access the cookbook here](https://www.securitylearningacademy.com/course/view.php?id=6114) (IBMid login required).

# Installation
Follow these steps to install the application on your system.

## Pre-requistes
You must have NodeJS installed and the npm (node package manager).  In order to clone the repository you will need to have git installed.

## Clone this repository
If you have git installed you can clone this repository with the command:
```bash
git clone https://github.com/iamexploring/verify-nodejs
```
## Install required node packages
Run the following commands to download the packages to the cloned application directory:
```bash
cd verify-nodejs
npm install
```

# IBM Security Verify configuration
Before you can use this application, you must configure your IBM Securiy Verify tenant to work with it.

## Create a Native Web Policy
In IBM Security Verify, create a new "Native Web App" policy.  Initially, take all the defaults.
- Later you can modify the requirements for first factor and multi-factor authentication.

## Create Application
In IBM Security Verify, create a custom application with the following properties:
Configuration Item | Value
--- | ---
Sign-on method | Open ID Connect 1.0
Application URL | http://localhost:3000
Grant types | JWT bearer, Context-based authorization
Send all known user attributes in the ID token | Checked
Access policy | Choose the Native Web App policy you created above

Save the application.

Under "Entitlements" Set the entitlements for the application to "Automatic access for all users and groups"

Under "API access", edit the application client and add the following access:
- Authenticate any user
- Read second-factor authentication enrollment for all users

Add an additional (privileged) API client and give it the following access:
- Manage second-factor authentication enrollment for all users
- Manage users and standard groups

# Configure Application
The sample application is configured using a .env file.
First, copy the dotenv.sample file:
```bash
cp dotenv.sample .env
```

Complete the .env file.  It has the following content:

```
TENANT_URL=https://xxxxx.verify.ibm.com

APP_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
APP_CLIENT_SECRET=xxxxxxxxxx

CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
CLIENT_SECRET=xxxxxxxxxx

AUTHENTICATOR_PROFILEID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

FIDO2_RP_UUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

ADAPTIVE_ENABLED=false
ADAPTIVE_OVERRIDE_IP=

SESSION_SECRET=somethinghardtoguess
SCOPE=oidc
```

The TENANT_URL is the URL for your IBM Security Verify tenant.

The other values can be found in the following locations in the IBM Security Verify admin UI:
Parameter(s) | Location
--- | ---
APP_CLIENT_ID and APP_CLIENT_SECRET | In "Sign-on" tab of the application definition.
CLIENT_ID and CLIENT_SECRET | In properties of the privileged client you created under "API access" tab of the application definition.
AUTHENTICATOR_PROFILEID | Under Security-->Registration profiles, select and entry and copy the Profile ID from details pane.
FIDO2_RP_UUID | Not currently available in UI.  Capture with dev tools. RP definition must be created. [See FIDO2 below](#FIDO2)
ADAPTIVE_ENABLED | Set to true to enable Adaptive Access functionality.  See below for additional pre-requisites.

# Start the application
Once you have completed the steps above, you can start the application with this command:
```bash
npm start
```

You can connect to the application at http://localhost:3000

# Adaptive access
This application can be used to demonstrate Adaptive Access if this is available in your IBM Security Verify tenant.  Follow the steps below.

## On-board your Application
In the Application definition, go to the **Adaptive sign-on** tab and enter an *Allowed domain*.  You must access the application using a host within this domain in order for Adaptive Access to function correctly.  Set up an alias in your local /etc/hosts file if you don't have a real DNS host.

Click **Generate**.  This starts the on-boarding process.  It can take some time (an hour or more) to complete.  You can leave the page and check back later.

When the on-boarding is complete, the page will show a web snippet.  You will need to add this to the application login page.

## Add web snippet to login page
Open the *views/ecommerce-login.hbs* file.  In this file, locate the line:

```
  	<!-- Paste web snippet here for Adaptive -->
```

Paste the web snippet from the application definition into the page at this point.

## Enable Adaptive function in .env file
In the *.env* file, set `ADAPTIVE_ENABLED=true`.

## Override local IP address if connecting locally
If you will connect to the demo application from the local machine you must provide your internet IP address so that this can override the local address that will otherwise be reported.  In the *.env* file, set `ADAPTIVE_OVERRIDE_IP=x.x.x.x` where `x.x.x.x` is your internet IP address.  To determine this address, you can use a service such as https://www.whatismyip.com/.

## Enable Adaptive Access in your Native Web App policy
In the Native Web App policy that is associated with your application, enable Adaptive Access.  Initially at least you should set your post-authentication rules to allow access (so that only Adaptive Access is controlling the need for 2nd Factor Authentication).

# FIDO2
To enable FIDO2 you must access the application using a hostname with a domain component.  You may have already set this up for Adaptive Access.  Set up an alias in your local /etc/hosts file if you don't have a real DNS host.

## Create FIDO2 Relying Party
Under Authentication-->FIDO2 Settings, create a new Relying Party definition.
Set the Relying Party identifier to the fully-qualified hostname clients will use to access the demo application (do not include port numbers here).
Select *Include all device metadata* to allow all types of FIDO2 device.
Add a URL for the base URL that clients will use to access the application.  This should include port number if not 80 or 443.
Save the new Relying Party.

## Get RP UUID
You will need the UUID of this Relying Party.  This is not currently available in the Admin UI but you can obtain it using browser developer tools to read from the REST request made when reading all RP definitions (look for request for .../metadata).
