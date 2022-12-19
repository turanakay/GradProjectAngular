export interface EventForm {
    eventName: string,
    eventDescription: string,
    maxGroupSize: number,
    maxPlayerSize: number,
    sDate: Date,
    eDate: Date,
    photos: File[],
    locations: string[],
    finalPhoto: File,
}