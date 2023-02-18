import Timelapse from '../models/Timelapse.js';
import Singlefile from '../models/Singlefile.js';
import User from '../models/User.js';
import { Gif } from 'make-a-gif';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import fs from 'fs/promises';
import * as fss from 'fs';
import { Buffer } from 'node:buffer';
import fetch from 'node-fetch';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// likely for dashboard
export const getAllTimelapses = async (req, res) => {
  try {
    const timelapseData = await Timelapse.find({}).populate('createdBy')
    res.status(200).json({ data: timelapseData })
  } catch (error) {
    res.status(500).json({ msg: error })
  }
}

export const getSingleTimelapse = async (req, res) => {
  try {
    const { id } = req.params
    const timelapseData = await Timelapse.findOne({ _id: id }).populate(
      'createdBy'
    )

    if (!timelapseData) {
      return res.status(404).json({ msg: `No user with id : ${id}` })
    }

    res.status(200).json({ data: timelapseData })
  } catch (error) {
    res.status(500).json({ msg: error })
  }
}

export const createTimelapse = async (req, res) => {
  try {
    //using a hardcoded user for testing
    const user = await User.findOne({ _id: '63ef0f84c72473760d654405' })
    const userImages = await Singlefile.find({ _id: { $in: user.images } });

    const fileNames = userImages.map(userImage => {
      return userImage.fileName
    })

    const generateBuffer = fileNames.map(fileName => {
      const file = fss.readFileSync(`./uploads/${fileName}`)
      return {
        src: Buffer.from(file)
      }
    })

    //We instance the class Gif and give the proportions of width 500 and height 500

    const myGif = new Gif(500, 500)

    await myGif.setFrames(generateBuffer)


    //Render the image, it will return a Buffer or it will give an error if anything goes wrong
    const Render = await myGif.encode()

    //Writes the gif in this folder
    await fs.writeFile(join(__dirname, '../gif/make-a-gif.gif'), Render)

    const timelapseFile = new Timelapse({
      name: "New Project",
      createdBy: "63ef0f84c72473760d654405",
      description: "Check out my new timelapse",
    });

    timelapseFile.save()

    await User.findOneAndUpdate(
      { _id: '63ef0f84c72473760d654405' },
      { $addToSet: { timelapse_gif: timelapseFile._id } },
      { new: true }
    );

    //const newTimelapse = await Timelapse.create(req.body)

    res.sendFile(join(__dirname, '../gif/make-a-gif.gif'));

  } catch (error) {
    console.log(error)
    res.status(500).json({ msg: error })
  }
}

export const updateTimelapse = async (req, res) => {
  try {
    const { id } = req.params
    const updatedTimelapse = await Timelapse.findOneAndUpdate(
      { _id: id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )

    res.status(200).json({ id: id, data: updatedTimelapse })
  } catch (error) {
    res.status(500).json({ msg: error })
  }
}

export const deleteTimelapse = async (req, res) => {
  try {
    const { id } = req.params
    const deletedTimelapse = await Timelapse.findOneAndDelete({ _id: id })

    if (!deletedTimelapse) {
      return res.status(404).json({ msg: `No user with id: ${id}` })
    }

    res.status(200).json({ deletedTimelapse })
  } catch (error) {
    res.status(500).json({ msg: error })
  }
}
