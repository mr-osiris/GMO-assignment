# React GrowMeOrganic Assignment - PrimeReact DataTable with Persistent Cross-Page Selection
__Project Overview:__

This project is basically a React app made with Vite and TypeScript, which shows artwork data from the Art Institute of Chicago using a PrimeReact DataTable. The main challenge was to make a paginated table where people can select rows across pages and keep their selection even when they move through different pages.

__How I Approached It:__

    At first, I looked at the requirements and realized I needed to do server-side pagination, so the app only fetches data for one page at a time to avoid slowing down the app or using too much memory.
    
    I also needed to keep track of which rows were selected across many pages, so I created a Map to hold the selected items globally. That way, even if you switch pages, it remembers what you selected before.
    
    For the UI, I wanted it to be simple but functional. I used a dropdown input in the table header to allow selecting multiple rows by number, which felt easier for users. The count of selected items shows clearly, and users can remove selections from a panel below the table.

__What I Learned and Used:__

    I mostly figured out the logic myself but checked PrimeReact website and some examples online when I got stuck.
    
    State management with React hooks (useState, useEffect) was important because I had to keep the local page data and global selections in sync.
    
    Handling async data fetching with Axios was straightforward but needed care with loading states and errors.
    
    Pagination with PrimeReact Datatable was a bit tricky because the API returns next and previous URLs, so I had to handle that properly.

__Logic Summary:__

    On page load or change, fetch only the current page data.
    
    Keep a map of selected rows from any pages.
    
    Update page selection UI to show which rows from the current page are selected.
    
    Changing the selection updates that global map and the UI panel.
    
    Removing from the panel unselects globally and locally.
    
    Input in the header lets users quickly select many rows across pages.
    
    Selection count and loading states keep user informed.

__Netlify Deployed Link:__ 
https://gmoartwork.netlify.app/
