# Q1 Project Proposal

**Personality Insights with Twitter and Watson**

## Project Description
Utilizing the Twitter API in conjunction with the IBM Watson API,
this app analyzes a person's character traits based on tweets they had sent.

## The problem this app helps solve :
  * The need for a visual representation of **non-biased personality data**.
  * Useful for vetting potential employees using non-traditional metrics.
  * A useful tool for anyone that would like to gain data-driven insight of another.

## Who has this problem?
  * Hiring staffs who rely on old technologies who are in need of another source of vetting. 
  * Anyone can use the app to have fun searching for friends or celebrities and seeing how Watson analyzes their personality  traits.
  * Untrusting individuals that demand insight on others outside of typical interactions.

## How will your project solve this problem?
By analyzing past comments, tweets, blogs, etc... the data cannot be manipulated and the person being analyzed cannot tinker their behavior or actions to influence the results. 

## What inputs does it need?
The twitter handle of an account that has made at least one tweet. Albeit due to the extremely small sample size, the results would be highly innacurate. Watson needs around 3500-6000 words of text before the results begin to converge to an accurate model of one's character traits. The text should ideally contain words about every day experiences, thoughts, and responses.

## What outputs does it produce?
When the text has been loaded, clicking the **analyze** button will query watson and show the results both in raw data and in a visual representation.

## What web API(s) will it use?
Twitter and IBM Watson

## What technologies do you plan to use?
- JavaScript
- IBM Watson Developer Cloud
- Node
- Express
- Bootstrap
- Git

## Feature list
* Custom professional design (including layout, navigation, header/footer, styles, formatting, text field, graph, logo, etc...)
* A text summary explaining the analysis
* A text response summarizing Watson's analysis
* A graphical representation of the data
