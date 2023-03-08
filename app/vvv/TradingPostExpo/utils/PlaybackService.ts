
import TrackPlayer, { 
    Event, 
    Capability,
    RepeatMode, } from 'react-native-track-player';

export const PlaybackService = async function() {

    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());

    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());

    // ...

};

export const SetupService = async (): Promise<boolean> => {
    let isSetup = false;
    try {
        await TrackPlayer.getCurrentTrack()
        await TrackPlayer.reset()
        isSetup = true;
    } catch {
        await TrackPlayer.setupPlayer({});
        await TrackPlayer.updateOptions({
            progressUpdateEventInterval: 0.1, 
            stoppingAppPausesPlayback: true
        })
        await TrackPlayer.setRepeatMode(RepeatMode.Queue)
        isSetup = true
    } finally {
        return isSetup;
    }
}
