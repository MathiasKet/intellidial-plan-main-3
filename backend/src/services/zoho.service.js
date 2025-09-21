import axios from 'axios';
import { logger } from '../utils/logger.js';

// Zoho CRM API configuration
const ZOHO_API_URL = `https://${process.env.ZOHO_CRM_DOMAIN || 'www.zohoapis.com'}/crm/v2`;

// Token storage
let accessToken = null;
let tokenExpiry = null;

/**
 * Get OAuth token from Zoho
 * @returns {Promise<string>} Access token
 */
const getAccessToken = async () => {
  try {
    // Check if we have a valid token
    if (accessToken && tokenExpiry && new Date() < new Date(tokenExpiry)) {
      return accessToken;
    }

    const response = await axios.post(
      'https://accounts.zoho.com/oauth/v2/token',
      new URLSearchParams({
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Update token and expiry (with 5 minute buffer)
    accessToken = response.data.access_token;
    tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000);

    return accessToken;
  } catch (error) {
    logger.error('Failed to get Zoho access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Zoho CRM');
  }
};

/**
 * Make an authenticated request to Zoho CRM API
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request data
 * @returns {Promise<Object>} Response data
 */
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const token = await getAccessToken();

    const response = await axios({
      method,
      url: `${ZOHO_API_URL}${endpoint}`,
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      data,
    });

    return response.data;
  } catch (error) {
    logger.error('Zoho API request failed:', {
      endpoint,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw new Error(`Zoho CRM API error: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Create or update a lead in Zoho CRM
 * @param {Object} leadData - Lead data
 * @param {string} leadData.email - Lead email
 * @param {string} leadData.firstName - Lead first name
 * @param {string} leadData.lastName - Lead last name
 * @param {string} leadData.phone - Lead phone number
 * @param {string} leadData.company - Company name
 * @param {string} leadData.website - Website URL
 * @param {string} leadData.leadSource - Lead source
 * @param {string} leadData.industry - Industry
 * @param {string} leadData.description - Description/notes
 * @returns {Promise<Object>} Created/updated lead
 */
export const upsertLead = async (leadData) => {
  try {
    // Check if lead with this email already exists
    const searchResponse = await makeRequest(
      'GET',
      `/Leads/search?email=${encodeURIComponent(leadData.email)}`
    );

    const existingLead = searchResponse.data?.[0];

    if (existingLead) {
      // Update existing lead
      const updateResponse = await makeRequest(
        'PUT',
        `/Leads/${existingLead.id}`,
        {
          data: [{
            ...leadData,
            id: existingLead.id,
          }],
        }
      );
      return updateResponse.data[0];
    }

    // Create new lead
    const createResponse = await makeRequest(
      'POST',
      '/Leads',
      {
        data: [leadData],
      }
    );

    return createResponse.data[0];
  } catch (error) {
    logger.error('Failed to upsert lead in Zoho CRM:', error);
    throw error;
  }
};

/**
 * Create a note for a record in Zoho CRM
 * @param {string} recordId - The ID of the record to add the note to
 * @param {string} module - The module name (e.g., 'Leads', 'Contacts')
 * @param {string} noteTitle - Note title
 * @param {string} noteContent - Note content
 * @returns {Promise<Object>} Created note
 */
export const createNote = async (recordId, module, noteTitle, noteContent) => {
  try {
    const response = await makeRequest(
      'POST',
      `/Notes`,
      {
        data: [
          {
            Note_Title: noteTitle,
            Note_Content: noteContent,
            Parent_Id: recordId,
            se_module: module,
          },
        ],
      }
    );

    return response.data[0];
  } catch (error) {
    logger.error('Failed to create note in Zoho CRM:', error);
    throw error;
  }
};

/**
 * Log a call in Zoho CRM
 * @param {Object} callData - Call data
 * @param {string} callData.recordId - Related record ID
 * @param {string} callData.module - Module name (e.g., 'Leads', 'Contacts')
 * @param {string} callData.subject - Call subject
 * @param {string} callData.description - Call description
 * @param {string} callData.callType - Type of call (e.g., 'Inbound', 'Outbound')
 * @param {string} callData.callDuration - Call duration in seconds
 * @param {string} callData.callStartTime - Call start time in ISO format
 * @param {string} callData.callResult - Result of the call
 * @returns {Promise<Object>} Created call log
 */
export const logCall = async (callData) => {
  try {
    const response = await makeRequest(
      'POST',
      '/Calls',
      {
        data: [
          {
            Call_Type: callData.callType,
            Subject: callData.subject,
            Description: callData.description,
            Call_Duration: callData.callDuration,
            Call_Start_Time: callData.callStartTime,
            Call_Result: callData.callResult,
            What_Id: callData.recordId,
            SEID: callData.recordId ? null : callData.module,
            $se_module: callData.recordId ? callData.module : null,
          },
        ],
      }
    );

    return response.data[0];
  } catch (error) {
    logger.error('Failed to log call in Zoho CRM:', error);
    throw error;
  }
};

/**
 * Search for records in Zoho CRM
 * @param {string} module - Module to search in (e.g., 'Leads', 'Contacts')
 * @param {string} criteria - Search criteria (Zoho query language)
 * @returns {Promise<Array>} Matching records
 */
export const searchRecords = async (module, criteria) => {
  try {
    const response = await makeRequest(
      'GET',
      `/${module}/search?criteria=${encodeURIComponent(criteria)}`
    );
    return response.data || [];
  } catch (error) {
    logger.error(`Failed to search ${module} in Zoho CRM:`, error);
    throw error;
  }
};

/**
 * Get a record by ID from Zoho CRM
 * @param {string} module - Module name (e.g., 'Leads', 'Contacts')
 * @param {string} id - Record ID
 * @param {Array<string>} fields - Fields to retrieve (default: all)
 * @returns {Promise<Object>} Record data
 */
export const getRecordById = async (module, id, fields = []) => {
  try {
    const fieldsParam = fields.length ? `?fields=${fields.join(',')}` : '';
    const response = await makeRequest('GET', `/${module}/${id}${fieldsParam}`);
    return response.data[0];
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Record not found
    }
    logger.error(`Failed to get ${module} from Zoho CRM:`, error);
    throw error;
  }
};
