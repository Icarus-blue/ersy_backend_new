import fs from 'fs'

function imageToBase64(imagePath) {
    const imageData = fs.readFile(imagePath, (err, data) => {

        if (err) throw new Error(err)
        const base64string = Buffer.from(data).toString('base64')
        return base64string;
    })

    return imageData

}

export { imageToBase64 }