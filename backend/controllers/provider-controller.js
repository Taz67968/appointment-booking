import { query } from "../config/db.js";
import logger from "../utils/logger.js";

export const getAllProviders = async (req, res) => {
  try {
    const { search, profession } = req.query;
    
    let providersQuery = `
      SELECT 
        id,
        first_name,
        last_name,
        email,
        profession,
        description
      FROM serviceProvider
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (search) {
      providersQuery += ` AND (
        LOWER(first_name) LIKE LOWER($${paramCount}) OR
        LOWER(last_name) LIKE LOWER($${paramCount}) OR
        LOWER(profession) LIKE LOWER($${paramCount}) OR
        LOWER(description) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search.toLowerCase()}%`);
      paramCount++;
    }
    
    if (profession) {
      providersQuery += ` AND LOWER(profession) = LOWER($${paramCount})`;
      params.push(profession);
      paramCount++;
    }
    
    providersQuery += ` ORDER BY first_name, last_name`;
    
    const providers = await query(providersQuery, params);
    
    logger.info(`Retrieved ${providers.rows.length} providers`);
    res.status(200).json(providers.rows);
  } catch (error) {
    logger.error("Error fetching providers:", error);
    res.status(500).json({ message: "Server error fetching providers" });
  }
};

export const getProviderTimeslots = async (req, res) => {
  try {
    const { providerId } = req.params;
    
    // First verify provider exists
    const providerCheck = await query(
      'SELECT id, first_name, last_name, profession, description FROM serviceProvider WHERE id = $1',
      [providerId]
    );
    
    if (providerCheck.rowCount === 0) {
      return res.status(404).json({ message: "Provider not found" });
    }
    
    // Get available timeslots (not booked)
    const timeslotsQuery = `
      SELECT 
        t.id,
        t.workingDays,
        t.startTime,
        t.endTime,
        t.booked
      FROM timeslot t
      WHERE t.owner_id = $1 AND (t.booked = FALSE OR t.booked IS NULL)
      ORDER BY 
        CASE t.workingDays
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
          ELSE 8
        END,
        t.startTime
    `;
    
    const timeslots = await query(timeslotsQuery, [providerId]);
    
    logger.info(`Retrieved ${timeslots.rows.length} available timeslots for provider ${providerId}`);
    res.status(200).json({
      provider: providerCheck.rows[0],
      timeslots: timeslots.rows
    });
  } catch (error) {
    logger.error("Error fetching provider timeslots:", error);
    res.status(500).json({ message: "Server error fetching timeslots" });
  }
};

