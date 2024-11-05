import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../UI/select';
import {Input} from '../UI/input';
import {useForm} from '@tanstack/react-form';
import {Button} from '../UI/button';
import {useAtom} from 'jotai';
import {useEffect} from 'react';
import {keystoreAtom} from '@/store/keystore';

export function Login() {
  const [keys, setKeys] = useAtom(keystoreAtom);

  useEffect(() => {
    // Listen for updates from the main process
    window.keystore.getKeys((v: string[]) => {
      console.log(v);
      setKeys(v);

      if (v !== null) {
        window.renderer.frontReady();
      }
    });
  }, [setKeys]);

  const {Field, handleSubmit, state} = useForm({
    defaultValues: {
      planet: '',
      address: '',
      password: '',
    },
    onSubmit: async ({value}) => {
      // Handle form submission
      console.log(value);
    },
  });

  return (
    <>
      <h1 className="font-bold text-3xl mb-6">Login</h1>
      <form
        className="flex flex-col gap-2"
        onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Field
          name="planet"
          children={({state, handleChange, handleBlur}) => (
            <Select defaultValue="0x000000000000">
              <SelectTrigger id="planet">
                <SelectValue placeholder="Planets" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Planets</SelectLabel>
                  <SelectItem value="0x000000000000">Odin</SelectItem>
                  <SelectItem value="0x000000000001">Heimdall</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        ></Field>

        <Field
          name="address"
          children={({state, handleChange, handleBlur}) => (
            <Select defaultValue={keys.length > 0 ? keys[0] : ''}>
              <SelectTrigger>
                <SelectValue placeholder="Address" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Address</SelectLabel>
                  {keys.map(key => (
                    <SelectItem
                      key={key}
                      value={key}
                    >
                      {key}
                    </SelectItem>
                  ))}{' '}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        ></Field>

        <Field
          name="password"
          children={({state, handleChange, handleBlur}) => (
            <Input
              type="password"
              defaultValue={state.value}
              onChange={e => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder="Passphrase"
            />
          )}
        />
        <div className="flex items-center justify-between pt-6">
          <Button
            className="font-bold rounded focus:outline-none focus:shadow-outline"
            type="button"
          >
            Sign In
          </Button>
          <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="#"
          >
            Forgot Password?
          </a>
        </div>
      </form>
    </>
  );
}
