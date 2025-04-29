import {query} from "../config/db.js"
import logger from "../utils/logger.js"



export async function deleteTimeslot(req,res, next) {
    const timeslotId = req.params.id
    const userId = req.user.id


    try {
        const deleteTimeslotQuery = `DELETE FROM timeslot WHERE id = $1 AND spId = $2 AND workingDays = $3 AND workingTime = $4 RETURNING id`
        const result = await query(deleteTimeslotQuery, [timeslotId, userId])


        if (result.rows.length === 0) {
            logger.warn(`Delete failed: Timeslot not found or access denied for timeslot ID ${timeslotId}, user ID ${userId}`)
            const checkTimeslotExistenceQuery = 'SELECT id FROM timeslot WHERE id = $1'
            const checkResult = await query (checkTimeslotExistenceQuery, [timeslotId])
            if (checkResult.rows.length === 0) {
                return res.status(404).json({message: "Timeslot does not exist"})
            }else{
                return res.status(403).json({message: "You don't have permission to delete this task"})
            }            
        }
        logger.info(`Timeslot ${timeslotId} deleted Successfully by user ${userId}`)
        return res.status(204).json({ message: "Timslot deleted Successfully"})
    } catch (error) {
        logger.error(`Error Deleting timslot ${timeslotId} for user ${userId} : `, error)
        return res.status(error.status || 500).json({message: error.message || "Server error while delete the timslot"})
    }
}


export async function updateTimeslot(req, res, next) {
    const timeslotId = req.params.id
    const userId = req.user.id
    const { workingDays, workingTime } = req.body
  
    try {
  
      const updateTimeslotQuery = `
                              UPDATE tasks SET workingDays= $1, workingTime= $2
                              WHERE id=$3 AND spId=$4
                              RETURNING *
                              `
      const result = await query(updateTimeslotQuery, [workingDays, workingTime,timeslotId, userId])
  
      if (result.rows.length === 0) {
        logger.warn(`Update failed: Timeslot not found or access denied for task ID ${timeslotId}, user ID ${userId}`)
        const checkTimeslotExistenceQuery = 'SELECT id FROM tasks WHERE id = $1'
        const checkResult = await query(checkTimeslotExistenceQuery, [timeslotId])
        if (checkResult.rows.length === 0) {
          return res.status(404).json({ message: "Task does not exist" })
        } else {
          return res.status(403).json({ message: "You do not have permission to update this task" })
        }
      }
  
      logger.info(`Timeslot ${timeslotId} updated Successfully by user ${userId}`)
      return res.json(result.rows[0])
    } catch (error) {
      logger.error(`Error Updating task ${timeslotId} for user ${userId} : `, error)
      return res.status(error.status || 500).json({ message: error.message || "Server error while update the task" })
    }
  }
  
  export async function getTimslotById(req, res, next) {
    const timeslotId = req.params.id
    const userId = req.user.id
  
    try {
      const getTaskQuery = `SELECT * FROM tasks WHERE id = $1 AND owner_id = $2`
      const result = await query(getTaskQuery, [timeslotId, userId])
  
      if (result.rows.length === 0) {
        logger.warn(`Task not found or access denied for task ID ${timeslotId}, user ID ${userId}`)
        return res.status(404).json({ message: "Task not found or you do not have permission to view it" })
      }
  
      logger.debug(`Fetched task ${timeslotId} for user ${userId}`)
      return res.json(result.rows[0])
    } catch (error) {
      logger.error(`Error fetching task ${timeslotId} for user ${userId} : `, error)
      return res.status(error.status || 500).json({ message: error.message || "Server error while fetching the task" })
    }
  }
  
  export async function getAllTimeslots(req, res, next) {
    const userId = req.user.id
    try {
      const fetchTimeslotsQuery = `SELECT workingDays = $1, workingTime = $2 FROM timeslot
                                WHERE owner_id = $1 ORDER BY created_at DESC
                              `
      const result = await query(fetchTimeslotsQuery, [userId])
      logger.debug(`Fetched ${result.rows.length} timeslot for user : ${userId}`)
      return res.status(200).json(result.rows)
    } catch (error) {
      logger.error(`Error fetching timeslots for user ${userId} : `, error)
      return res.status(error.status || 500).json({ message: error.message || "Server error while fetching the timeslot" })
    }
  }
  
  export async function createTimeslotHandler(req, res, next) {
    const { workingDays,workingTime } = req.body
    const userId = req.user.id
    try {
      const insertTimeslotQuery = `
        INSERT INTO timeslot (id,spId,workingDays,workingTime)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const result = await query(insertTimeslotQuery, [userId, workingDays,workingTime])
      const newTimeslot = result.rows[0]
      logger.info(`Timeslot created Successfully by the user ${userId} : ${newTimeslot.id}`)
      return res.status(201).json(newTimeslot)
    } catch (error) {
      logger.error(`Error creating task for user ${userId} : `, error)
      return res.status(error.status || 500).json({ message: error.message || "Server error while creating the task" })
    }
  }
  