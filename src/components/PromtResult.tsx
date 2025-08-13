import * as React from 'react';
import { Backdrop, Box, Button, Modal, Typography } from '@mui/material';
import { useSpring, animated } from '@react-spring/web';
import { X } from 'lucide-react';
import Grid from '@mui/material/Grid';
import JsonView from '@uiw/react-json-view';

interface FadeProps {
    children: React.ReactElement<any>;
    in?: boolean;
    onClick?: any;
    onEnter?: (node: HTMLElement, isAppearing: boolean) => void;
    onExited?: (node: HTMLElement, isAppearing: boolean) => void;
    ownerState?: any;
}

const Fade = React.forwardRef<HTMLDivElement, FadeProps>(function Fade(props, ref) {
    const {
        children,
        in: open,
        onClick,
        onEnter,
        onExited,
        ownerState,
        ...other
    } = props;
    const style = useSpring({
        from: { opacity: 0 },
        to: { opacity: open ? 1 : 0 },
        onStart: () => {
            if (open && onEnter) {
                onEnter(null as any, true);
            }
        },
        onRest: () => {
            if (!open && onExited) {
                onExited(null as any, true);
            }
        },
    });

    return (
        <animated.div ref={ref} style={style} {...other}>
            {React.cloneElement(children, { onClick })}
        </animated.div>
    );
});

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 1000,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

interface PromptResultProps {
    open: boolean;
    onClose: () => void;
    promptAndResult: {
        prompt: string;
        questions: {
            question: string;
            options: string[];
            correctAnswer: number;
            explanation: string;
        }[];
    } | null;
}

export default function PromptResult({ open, onClose, promptAndResult }: PromptResultProps) {
    const { prompt, questions } = promptAndResult || {};
    return (
        <div>
            <Modal
                aria-labelledby="spring-modal-title"
                aria-describedby="spring-modal-description"
                open={open}
                onClose={onClose}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        TransitionComponent: Fade,
                    },
                }}
            >
                <Fade in={open}>
                    <Box sx={style} position="relative">
                        <Button
                            onClick={onClose}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                minWidth: 0,
                                padding: 0,
                                borderRadius: '50%',
                                width: 32,
                                height: 32,
                                lineHeight: 1,
                            }}
                            aria-label="close"
                        >
                            <X />
                        </Button>
                        <Grid container spacing={2}>
                            <Grid size={6} sx={{ maxHeight: 400, overflowY: 'auto', mt: 2 }}>
                                <Typography id="spring-modal-title" variant="h6" component="h2">
                                    Prompt
                                </Typography>
                                <div style={{ maxHeight: 400, overflowY: 'auto', marginTop: 2 }}>
                                    <Typography variant="body2" fontSize={10} component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace', background: '#f5f5f5', p: 2, borderRadius: 1 }}>
                                        {prompt}
                                    </Typography>
                                </div>
                            </Grid>
                            <Grid size={6} borderLeft={1} pl={2} sx={{ maxHeight: 400, overflowY: 'auto', mt: 2 }}>
                                <Typography id="spring-modal-title" variant="h6" component="h2">
                                    Result
                                </Typography>
                                <div style={{ maxHeight: 400, overflowY: 'auto', marginTop: 2 }}>
                                    <Typography
                                        variant="body2"
                                        component="pre"
                                        sx={{
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-all',
                                            fontFamily: 'monospace',
                                            background: '#f5f5f5',
                                            p: 2,
                                            borderRadius: 1,
                                        }}>
                                        <JsonView
                                            collapsed={false}
                                            enableClipboard={false}
                                            style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 10 }}
                                            displayDataTypes={false}       // hide types
                                            displayObjectSize={false}
                                            value={questions} />
                                    </Typography>
                                </div>
                            </Grid>
                        </Grid>
                    </Box>
                </Fade>
            </Modal>
        </div>
    );
}