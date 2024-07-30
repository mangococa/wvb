# wvb
Weirdo Volume Bot

Weirdo Volume Bot (WVB) is a proprietary web3 trading application that automates swaps exclusively for the WETH/WEIRDO Uniswap v3 trading pair on Base Network. The purpose of WVB is to conduct automated swaps between ETH and Weirdo (buy and sell back and forth) to achieve trending status on various DEX trackers. 

This document was made to guide ChatGPT in developing this application. The author of this document has limited to no experience in full stack development. While this document attempts to provide all relevant information needed to begin the development process, please keep in mind that ChatGPT may need to fill in certain gaps. Use this document as a reference point during the development process.

Features:
-	Volume Trading: automated swapping of WETH/WEIRDO for a user-specified amount of volume (in ETH) over a user-specified amount of time (in hours).
-	Wallet Connection: connect Coinbase Wallet to application to fund trading account
Frontend:
-	Web UI: a React.js webpage with a simple, interactive, modern design, like Uniswap’s swap webapp.
User Journey:
-	User navigates to WVB webpage and is presented with landing page with a “connect wallet” button in the top right corner.
-	User connects to Coinbase Wallet.
-	Application displays the user’s wallet address, ETH Balance, and WETH balance. Application has fields for user to input parameters:
o	Total Volume in ETH: (box for entry)
o	Timeframe in Hours: (box for entry)
o	“Continue to Preview” button
-	User enters data into fields above > clicks “Continue to Preview” > backend computes several parameters to display on next page.
-	Next page presents a preview of the application swap information:
o	Total Volume: (display total volume) USD (convert the inputted ETH amount from previous page to a dollar amount using current ETH price)
o	Time to Completion: (Timeframe input from previous page) Hours
o	Swap Size: (size of WEIRDO buy orders per individual swap) USD
o	Total Swaps: (number of total swaps)
o	Estimated Base Network Cost: (estimated total Base Network transaction costs) in ETH
o	Estimated Uniswap LP Fees: (estimated total cost for LP fees charged by Uniswap v3 WETH/WEIRDO LP) in WETH
o	Total Cost: (Base Network transaction fees + Uniswap LP fees) converted to ETH equivalent (1 ETH = 1 WETH) for display purposes
o	ETH Deposit Amount: (amount of ETH needed for transactions) ETH
o	WETH Deposit Amount: (amount of WETH needed to carry out the specified volume of trading)
o	“Back” button (takes you to previous module where user can input parameters)
o	“Initiate Volume Bot” button
	This button will be blocked/grayed out with an error message “not enough ETH and/or WETH for parameters given; please lower total volume or add ETH and/or WETH to account” if the connected wallet does not have enough ETH and/or WETH to cover the gas costs plus a reasonable margin of safety (0.03 ETH and/or WETH).
-	If user clicks “Back” button, they’re taken to the previous page where they can change their input for Total Volume in ETH and Timeframe in Hours fields.
-	If user clicks “Initiate Volume Bot”, the user will be prompted to sign a transaction that sends WETH to the WVB’s internal wallet.
o	A successful transaction will notify the user that transaction was successful and present a transaction ID for the Base Network transaction.
o	A failed transaction will notify the user that transaction failed and bring user back to previous page.
-	Once the transaction is signed and completed, the application will generate 5 new ETH wallets that will conduct the swapping activity. The 5 wallet addresses will be presented on screen for the user to note. There will also be an “active” status while the bot is swapping, which will change to “completed” when the swapping activity for the entire volume and timeframe is completed.
Backend Logic:
-	The application will have a seed phrase for its own Ethereum wallet, called the Parent Wallet. This seed phrase must be securely stored, and encryption should be used, when possible, to prevent the seed phrase from being exposed/leaked.
o	This seed phrase will be used to generate 5 new wallets each time the application is run, called Daughter Wallets. These 5 daughter wallets are only used for that instance of the application running. When the application completes the timeframe and volume, the wallet addresses are archived as “past used wallet addresses” along with all the relevant information needed (such as the derivation path) to access said wallet address from the Coinbase Wallet extension (except for the seed phrase, which is known by the developer, and should be confined to being stored as securely as possible with limited exposure)
o	The next instance of the application running the volume swap process, 5 new daughter wallets will be created from the same parent wallet seed phrase.

-	The backend will need to receive certain parameters from the frontend, including:
o	User’s WETH balance on Base
o	User’s ETH balance on Base
o	User input for ‘Total Volume in WETH’ (WETH value)
o	User input for ‘Timeframe in Hours’ (in hours)

-	The backend will need to pull certain parameters from the Base network, including:
o	Current transaction cost on Base (in ETH)
	Average Uniswap swap gas fee
	Average ETH transfer gas fee
	Average WETH transfer gas fee
o	The LP fee (%) from the WETH/WEIRDO pool (it’s 1%) (CA 0xcB4AAA0B65c143b67021549de5deE6f0C8421966)
o	Current USD price of WETH

-	The backend will need to perform certain calculations during the “prepare phase”, prior to the user signing a message to perform two deposits; one ETH transfer, one WETH transfer.
o	To determine the Estimated Base Network Cost, we first calculate the number of total swaps needed based on a backend swap size parameter:
	Swap size parameter is hardcoded but can be adjust during development process; start with variable at 0.001 WETH
	Eg. Total volume desired is 1 ETH. To achieve this, a total of 0.5 WETH worth of WEIRDO buys must be conducted, and 0.5 WETH worth of WEIRDO sells. The buys will be broken down to increments of the swap size parameter (ie 0.001 WETH). So, 0.5 WETH/0.001 WETH = 500 buys. For every 9 buys, 1 sell for the total amount of WEIRDO token in that wallet will be carried out. So, each sell will be for approximately 9*0.001 WETH = 0.009 WETH per sell. 0.5 WETH/0.009 = approximately 56 sells. 
•	Total # of buys = 500
•	Total # of sell = 56
•	Total # of swaps to be conducted = 556
o	Using the total number of swaps to be carried out times the average Base gas fee for Uniswap trades, the estimated Base network transaction fee can be determined. 
	Eg. The current average gas cost for Uniswap trades on Base network is 0.000004333897535405601 ETH. 556 swaps * 0.000004333897535405601 ETH = 0.002409647 ETH
	Note that Base network fees are paid in ETH (the native token), not WETH (a wrapped ETH token)
o	In addition to the swapping gas fees, several transfers will be conducted:
	Transfer WETH from parent wallet to 5 daughter wallets (5 transfers)
	Transfer WETH from 5 daughter wallets to parent wallet after all swaps are completed (5 transfers)
	Transfer WETH from parent wallet to user wallet to complete the process (1 transfer)
	Transfer ETH from parent wallet to 5 daughter wallets (5 transfers)
	Transfer ETH from 5 daughter wallets to parent wallet after all swaps are completed (5 transfers)
	Transfer ETH from parent wallet to user wallet to complete the process (1 transfer)
	11 WETH transfers (ERC20 transfers) * 0.0000013287626607380594 (average gas fee for ERC20 transfer on Base) = 0.0000146164 ETH
	11 ETH transfers * 5.374218226474183e-7 = 0.0000059116 ETH
	Total transfer fee estimate = 0.000020528 ETH
o	The total fees in ETH for swapping and transferring is equal to:
	Uniswap swap gas fees total + transfer gas fees total  
	0.002409647 ETH + 0.000020528 ETH = 0.002430175 ETH
	The ETH Deposit amount must exceed the total fees in ETH to run through the application by a margin of safety of 2x
•	The ETH Deposit requirement (ie the amount of ETH the user deposits into the parent wallet) will be 0.002431075 ETH * 2 = 0.00486035 ETH.
o	To calculate the Estimated Uniswap LP Fees Paid, we take the fee tier for the WETH/WEIRDO pool (ie. 1% of volume) and multiply by user’s desired volume.
	Eg. 1 WETH of volume -> 1 WETH * 0.01 = 0.01 WETH in Uniswap LP Fees
	The WETH Deposit requirement is equal to:
•	Total Uniswap LP fees + (50*buy swap size)
•	Eg. 0.01 WETH + (50*0.001) = 0.06 WETH

-	The backend will need to create 5 new wallets using a seed phrase provided in the .env file, then fund said wallets for swapping.
o	Swapping will be carried out by daughter wallets, not the parent wallet
o	Each daughter wallet will carry out 1/5 of the total volume
	Eg. For 1 WETH of total volume to swap, each daughter wallet will carry out 0.2 WETH of volume
o	Each daughter wallet will receive 1/5 of the WETH deposited
	Eg. 0.06 WETH deposited to parent wallet > 0.012 WETH is transferred to each daughter wallet
o	Each daughter wallet will receive [(1.8*ETH Deposit Amount)/5] in ETH from parent wallet after deposit from user
	This leaves a small amount of ETH in parent wallet in order to conduct certain onchain operations
o	Each daughter wallet will carry out swaps according to the following parameters:
	Buy_size = 0.001 WETH
	Sell_size = weirdo balance
	Each daughter wallet will carry out 9 buy orders, followed by 1 sell order:
•	All ten orders (9 buy orders followed by 1 sell order) will occur with 30 seconds in between each order.
o	Total time to complete 10 orders is 4 minutes 30 seconds
•	We can reference this series of 9 buys and 1 sell as a swap block cycle
	To determine the time in between swap block cycles, we need to first determine what the average time interval should be given the total number of swaps and the target total volume 
•	Eg. Avg time interval = 24 hours for 556 swaps, or 1 swap every 155.4 seconds
	Using that average, we know that 10 swaps should take about (155.4 seconds * 10) 1554 seconds, or 25 minutes 54 seconds. Since the swap block cycle takes 4 minutes and 30 seconds, the amount of time in between swap block cycles should be (25:54 – 4:30) 21 minutes 24 seconds.
	The daughter wallets should stagger their start times so that they are not all conducting swaps at the same time.
•	Assign each daughter wallet a sequential n-value from 0-4
o	Daughter wallet 0, 1, 2, 3, and 4
•	Stagger daughter wallet start times by (n+1)*270, where n is the daughter wallet ID. 

Additional Details:
-	WETH/WEIRDO Uniswap v3 pool address: 0xcB4AAA0B65c143b67021549de5deE6f0C8421966
-	WEIRDO CA: 0x76734B57dFe834F102fB61E1eBF844Adf8DD931e
-	WETH CA: 0x4200000000000000000000000000000000000006
-	https://base-mainnet.g.alchemy.com/v2/_Y3OwAuZbct_RW9YhwVAdFbxw8uw4Nqu
-	Seed phrase for internal wallet is securely stored in an environment variable and encrypted. 
-	WETH is wrapped ETH on Base network. 1 WETH == 1 ETH, though their dollar amount many vary minimally, due to them being separate tokens with separate markets. 



