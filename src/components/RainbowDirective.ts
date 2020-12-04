import {DirectiveOptions} from "vue";
import * as _ from "lodash";

export const RainbowDirective: DirectiveOptions = {
    inserted(el, node) {
        const hueString = (input: string): string => {
            let hash = 0;
            if (input.length === 0) return hash + '';
            for (let i = 0; i < input.length; i++) {
                hash = input.charCodeAt(i) + ((hash << 5) - hash);
                hash = hash & hash;
            }
            return (hash % 360) + '';
        }

        if (el && _.get(node, 'value.from', false)) {
            el.style.color = `hsl(${hueString(_.get(node, 'value.from'))}, 70%, 50%)`;
        }
    }
}