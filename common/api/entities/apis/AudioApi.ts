import { EntityApi } from '../static/EntityApi'
import { IAudioGet,IAudioList } from '../interfaces'
import { Audio as Extensions } from './extensions'
class AudioApi extends EntityApi<IAudioGet,IAudioList,never,never> {
    protected getFunction = "public.api_audio_get";
    protected listFunction = "public.api_audio_list";
    protected insertFunction = '';
    protected updateFunction = '';
    protected apiCallName = 'AudioApi';
    extensions = new Extensions.default(this)
}
export default new AudioApi();
export type {IAudioGet,IAudioList}
